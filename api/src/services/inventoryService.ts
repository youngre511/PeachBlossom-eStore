import { sqlInventory } from "../models/mysql/sqlInventoryModel.js";
import { sqlCart } from "../models/mysql/sqlCartModel.js";
import { sqlCartItem } from "../models/mysql/sqlCartItemModel.js";
import { sqlProduct } from "../models/mysql/sqlProductModel.js";
import Product from "../models/mongo/productModel.js";
import sequelize from "../models/mysql/index.js";
import mongoose, { ClientSession } from "mongoose";
import { Model } from "sequelize-typescript";
import { getAdminProducts } from "./productService.js";
import { AdminFilterObj, JoinReqInventory } from "./serviceTypes.js";
import { getCart } from "./cartService.js";
let syncInProgress = false;

// Interfaces

// Parsed version of BaseProduct that lacks the additional properties of a sequelize Model
interface ParsedInventoryProduct {
    id: number;
    productNo: string;
    productName: string;
    price: number;
    description: string;
    category_id: number;
    subcategory_id?: number;
    thumbnailUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

// Parsed version of BaseInventory that lacks the additional properties of a sequelize Model but includes Product info
interface ParsedInventory {
    inventory_id: number;
    product_id: number;
    stock: number;
    reserved: number;
    available: number;
    Product: ParsedInventoryProduct;
}

export const holdStock = async (cartId: number) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        let cartChangesMade: boolean = false;

        const cart = await sqlCart.findByPk(cartId);
        if (!cart) {
            throw new Error("Unable to retrieve cart to set expiration");
        }

        //Get the current time, the expiration time, and the expiration time minus 30 sec all in UTC for later comparison.
        //If cart.dataValues.checkoutExpiration is null, it will give the Unix epoch and not cause errors. This is fine, because these variables are used only if cart.dataValues.checkoutExpiration is not null (see below).

        const expirationMinusGracePeriod = new Date(
            cart.dataValues.checkoutExpiration
        );
        expirationMinusGracePeriod.setSeconds(
            expirationMinusGracePeriod.getSeconds() - 30
        );
        const currentTime = new Date();

        // Issue a new cart expiration date if no expiration date exists or if the current time is within the 30 second grace period after the front-end 5min timer.
        // Expiration date is 30 seconds longer than the front-end countdown in order to prevent conflicts if checkout executes at the same moment that the lambda releaseHold function clears expiration dates and inventory holds.
        // Logic allows user to reinitiate expiration countdown immediately after front-end countdown ends without losing their inventory reservations
        let expirationTime: string;
        if (
            !cart.dataValues.checkoutExpiration ||
            currentTime >= expirationMinusGracePeriod
        ) {
            const expirationDate = new Date();

            expirationDate.setMinutes(expirationDate.getMinutes() + 5);

            expirationTime = expirationDate.toISOString();

            expirationDate.setSeconds(expirationDate.getSeconds() + 30);
            const utcExpirationDate = expirationDate.toISOString();
            await sqlCart.update(
                { checkoutExpiration: utcExpirationDate },
                { where: { cart_id: cartId }, transaction: sqlTransaction }
            );
        } else {
            const cartTime = new Date(cart.dataValues.checkoutExpiration);
            cartTime.setSeconds(cartTime.getSeconds() - 30);
            expirationTime = cartTime.toISOString();
        }

        const cartItems = await sqlCartItem.findAll({
            where: { cart_id: cartId },
            lock: sqlTransaction.LOCK.UPDATE,
            transaction: sqlTransaction,
        });

        if (!cartItems) {
            throw new Error("Unable to retrieve items");
        }
        // Execute hold only if item is not marked as reserved in order to avoid duplicate holds.
        const unreservedCartItems = cartItems.filter((item) => !item.reserved);

        if (unreservedCartItems.length === 0) {
            await sqlTransaction.commit();
            const nonUpdatedCart = await getCart({ cartId });
            return {
                expirationTime: expirationTime,
                cart: nonUpdatedCart,
                cartChangesMade: cartChangesMade,
            };
        }

        const productNos = unreservedCartItems.map((item) => item.productNo);
        const products = await sqlProduct.findAll({
            where: { productNo: productNos },
            transaction: sqlTransaction,
        });

        if (products.length === 0) {
            throw new Error("No product records found for all products");
        }

        const productMap = new Map(
            products.map((product) => [product.productNo, product])
        );
        const productIds = products.map((product) => product.id);

        const inventories = await sqlInventory.findAll({
            where: { product_id: productIds },
            attributes: [
                "inventory_id",
                "reserved",
                "product_id",
                [sequelize.literal("stock - reserved"), "available"],
            ],
            lock: sqlTransaction.LOCK.UPDATE,
            transaction: sqlTransaction,
        });

        if (inventories.length === 0) {
            throw new Error("No inventory records found for all products");
        }

        const inventoryMap = new Map(
            inventories.map((inv) => [inv.product_id, inv])
        );

        for (const item of unreservedCartItems) {
            const product = productMap.get(item.productNo);
            if (!product) {
                throw new Error(
                    `Product not found for productNo: ${item.productNo}`
                );
            }

            const inventory = inventoryMap.get(product.id);
            if (!inventory) {
                throw new Error(
                    `Inventory record not found for product_id: ${product.id}`
                );
            }

            console.log(
                "available:",
                Number(inventory.getDataValue("available"))
            );
            // Check if the available stock is sufficient
            const available = Number(inventory.getDataValue("available"));
            const quantityNeeded = item.quantity;
            if (available >= quantityNeeded) {
                // Update the reserved amount in the inventory
                const newReserved = inventory.reserved + quantityNeeded;
                await inventory.update(
                    { reserved: newReserved },
                    { transaction: sqlTransaction }
                );
                // Mark the cart item as reserved
                await item.update(
                    { reserved: true },
                    { transaction: sqlTransaction }
                );
            } else if (available === 0) {
                // Remove item from cart if no longer available
                const count = await sqlCartItem.destroy({
                    where: { cart_item_id: item.cart_item_id },
                    force: true,
                    transaction: sqlTransaction,
                });
                if (count === 0) {
                    throw new Error(
                        `An error occurred when deleting productNo ${product.productNo} from cart due to unavailability`
                    );
                }
                cartChangesMade = true;
            } else {
                // If the number of available items is less than the number in the cart, reduce number in the cart to the number available.
                await item.update(
                    {
                        reserved: true,
                        quantity: available,
                    },
                    { transaction: sqlTransaction }
                );
                // Update the reserved amount in the inventory
                const newReserved = inventory.reserved + available;
                await inventory.update(
                    { reserved: newReserved },
                    { transaction: sqlTransaction }
                );
                cartChangesMade = true;
            }
        }

        await sqlTransaction.commit();

        const updatedCartObj = await getCart({ cartId });
        return {
            expirationTime: expirationTime,
            cart: updatedCartObj,
            cartChangesMade: cartChangesMade,
        };
    } catch (error) {
        await sqlTransaction.rollback();
        throw error;
    }
};

export const extendHold = async (cartId: number) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const cart = await sqlCart.findByPk(cartId, {
            lock: sqlTransaction.LOCK.UPDATE,
            transaction: sqlTransaction,
        });
        if (!cart) {
            throw new Error("Unable to retrieve cart to set expiration");
        }

        //Get the current time, the expiration time, and the expiration time minus 60 sec all in UTC for later comparison.
        //If cart.dataValues.checkoutExpiration is null, it will give the Unix epoch and not cause errors. This is fine, because these variables are used only if cart.dataValues.checkoutExpiration is not null (see below).

        const recordedExpirationMinus60Sec = new Date(
            cart.dataValues.checkoutExpiration
        );
        const recordedExpiration = new Date(cart.dataValues.checkoutExpiration);
        recordedExpirationMinus60Sec.setSeconds(
            recordedExpirationMinus60Sec.getSeconds() - 60
        );

        const currentTime = new Date();

        // Issue a new cart expiration date if the current time is within the period from 30 seconds before the front-end 5 min timer expires to the end of the 30 second grace period after the front-end timer.
        // Expiration date is 30 seconds longer than the front-end countdown in order to prevent conflicts if checkout executes at the same moment that the lambda releaseHold function clears expiration dates and inventory holds.
        let expirationTime: string;
        if (
            currentTime < recordedExpiration &&
            currentTime >= recordedExpirationMinus60Sec
        ) {
            const expirationDate = new Date();

            expirationDate.setMinutes(expirationDate.getMinutes() + 5);

            expirationTime = expirationDate.toISOString();

            expirationDate.setSeconds(expirationDate.getSeconds() + 30);
            const utcExpirationDate = expirationDate.toISOString();
            await cart.update(
                { checkoutExpiration: utcExpirationDate },
                { transaction: sqlTransaction }
            );
        } else {
            expirationTime = recordedExpiration.toISOString();
        }
        await sqlTransaction.commit();

        return expirationTime;
    } catch (error) {
        await sqlTransaction.rollback();
        throw error;
    }
};

export const updateStockLevels = async (
    updateData: Record<string, number>,
    filters: AdminFilterObj
) => {
    const sqlTransaction = await sequelize.transaction();

    try {
        //SQL Updates
        const productNos = Object.keys(updateData);

        const inventoryRecords = (await sqlInventory.findAll({
            include: [
                {
                    model: sqlProduct,
                    as: "Product",
                    where: {
                        productNo: productNos,
                    },
                },
            ],
            nest: true,
            transaction: sqlTransaction,
            lock: sqlTransaction.LOCK.UPDATE,
        })) as unknown as JoinReqInventory[];

        for (const record of inventoryRecords) {
            const newStockAmount = Number(
                updateData[record.dataValues.Product.dataValues.productNo]
            );

            if (newStockAmount !== undefined) {
                await sqlInventory.update(
                    { stock: newStockAmount },
                    {
                        where: { inventory_id: record.dataValues.inventory_id },
                        transaction: sqlTransaction,
                    }
                );
            }
        }

        // Mongo Records will be synced automatically in the lambda-function-triggered syncStockLevels function.

        await sqlTransaction.commit();

        const productsUpdate = await getAdminProducts(filters);

        return productsUpdate;
    } catch (error) {
        await sqlTransaction.rollback();
        throw error;
    }
};

export const syncStockLevels = async () => {
    if (!syncInProgress) {
        syncInProgress = true;
        const session: ClientSession = await mongoose.startSession();
        session.startTransaction();
        try {
            const allProducts = await sqlInventory.findAll({
                attributes: [
                    [sequelize.literal("stock - reserved"), "available"],
                ],
                include: [
                    {
                        model: sqlProduct,
                        as: "Product",
                        attributes: ["productNo"],
                    },
                ],
            });

            if (allProducts.length === 0) {
                throw new Error("No inventory found in mysql database");
            }

            const bulkUpdates = allProducts.map((record) => ({
                updateOne: {
                    filter: {
                        productNo:
                            record.dataValues.Product.dataValues.productNo,
                    },
                    update: { $set: { stock: record.dataValues.available } },
                },
            }));

            const result = await Product.bulkWrite(bulkUpdates, { session });
            console.log("Bulk update result:", result);

            await session.commitTransaction();

            return {
                statusCode: 200,
                body: JSON.stringify({ status: "Complete" }),
            };
        } catch (error) {
            await session.abortTransaction();
            console.error("error during execution:", error);
            let message: string = "";
            if (error instanceof Error) {
                message = error.message;
            } else {
                message =
                    "An unknown error occurred while syncing stock levels";
            }
            return {
                statusCode: 500,
                body: JSON.stringify({ error: message }),
            };
        } finally {
            await session.endSession();
            syncInProgress = false;
        }
    } else {
        return {
            statusCode: 429,
            body: JSON.stringify({ error: "Sync already in progress" }),
        };
    }
};
