import { sqlInventory } from "../models/mysql/sqlInventoryModel.js";
import { sqlCart } from "../models/mysql/sqlCartModel.js";
import { sqlCartItem } from "../models/mysql/sqlCartItemModel.js";
import { sqlProduct } from "../models/mysql/sqlProductModel.js";
import Product from "../models/mongo/productModel.js";
import { JoinReqCart } from "./cartService.js";
import sequelize from "../models/mysql/index.js";
import mongoose, { ClientSession } from "mongoose";
import { Model } from "sequelize-typescript";
import { AdminFilterObj, getAdminProducts } from "./productService.js";

interface ParsedInventoryProduct {
    id: number;
    productNo: string;
    productName: string;
    price: number;
    description: string;
    category_id: number;
    subCategory_id?: number;
    thumbnailUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface JoinReqInventoryProduct extends Model {
    id: number;
    productNo: string;
    productName: string;
    price: number;
    description: string;
    category_id: number;
    subCategory_id?: number;
    thumbnailUrl?: string;
    createdAt: Date;
    updatedAt: Date;
}

interface ParsedInventory {
    inventory_id: number;
    product_id: number;
    stock: number;
    reserved: number;
    available: number;
    Product: JoinReqInventoryProduct | ParsedInventoryProduct;
}

interface JoinReqInventory extends ParsedInventory, Model {}

export const holdStock = async (cartId: number) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const cartItems = await sqlCartItem.findAll({
            where: { cart_id: cartId },
            transaction: sqlTransaction,
        });

        if (!cartItems) {
            throw new Error("Unable to retrieve items");
        }

        for (const item of cartItems) {
            // Execute only if item is not marked as reserved in order to avoid duplicate holds.
            if (!item.dataValues.reserved) {
                const product = await sqlProduct.findOne({
                    where: { productNo: item.dataValues.productNo },
                    transaction: sqlTransaction,
                });
                if (product) {
                    const inventory = await sqlInventory.findOne({
                        where: { product_id: product.dataValues.id },
                        attributes: [
                            "inventory_id",
                            "reserved",
                            [
                                sequelize.literal("stock - reserved"),
                                "available",
                            ],
                        ],
                        transaction: sqlTransaction,
                    });
                    if (
                        inventory &&
                        inventory.dataValues.available >=
                            item.dataValues.quantity
                    ) {
                        const newReserved =
                            inventory.dataValues.reserved +
                            item.dataValues.quantity;
                        await inventory.update(
                            { reserved: newReserved },
                            { transaction: sqlTransaction }
                        );
                        await item.update(
                            { reserved: true },
                            { transaction: sqlTransaction }
                        );
                    } else {
                        throw new Error(
                            "Unable to find inventory record or insufficient stock"
                        );
                    }
                }
            } else {
                throw new Error("product not found");
            }
        }
        const cart = await sqlCart.findByPk(cartId);
        if (!cart) {
            throw new Error("Unable to retrieve cart to set expiration");
        }

        //Get the current time, the expiration time, and the expiration time minus 30 sec all in UTC for later comparison.
        //If cart.dataValues.checkoutExpiration is null, it will give the Unix epoch and not cause errors. This is fine, because these variables are used only if cart.dataValues.checkoutExpiration is not null (see below).
        const recordedExpiration = new Date(cart.dataValues.checkoutExpiration);
        const recordedExpirationMinus30Sec = new Date(
            cart.dataValues.checkoutExpiration
        );
        recordedExpirationMinus30Sec.setSeconds(
            recordedExpirationMinus30Sec.getSeconds() - 30
        );
        const currentTime = new Date();

        // Issue a new cart expiration date if no expiration date exists or if the current time is within the 30 second grace period after the front-end 5min timer.
        // Expiration date is 30 seconds longer than the front-end countdown in order to prevent conflicts if checkout executes at the same moment that the lambda releaseHold function clears expiration dates and inventory holds.
        // Logic allows user to reinitiate expiration countdown immediately after front-end countdown ends without losing their inventory reservations
        if (
            !cart.dataValues.checkoutExpiration ||
            (currentTime < recordedExpiration &&
                currentTime >= recordedExpirationMinus30Sec)
        ) {
            const expirationDate = new Date();
            const utcExpirationDate = expirationDate.toISOString();
            expirationDate.setMinutes(expirationDate.getMinutes() + 5);
            expirationDate.setSeconds(expirationDate.getSeconds() + 30);
            await sqlCart.update(
                { checkoutExpiration: utcExpirationDate },
                { where: { cart_id: cartId }, transaction: sqlTransaction }
            );
        }
        await sqlTransaction.commit();
        return true;
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error("Error holding stock: " + error.message);
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error(
                "An unknown error occurred while placing hold on stock"
            );
        }
    }
};

export const releaseStock = async (cartId: number) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const cartItems = await sqlCartItem.findAll({
            where: { cart_id: cartId },
            transaction: sqlTransaction,
        });

        if (!cartItems) {
            throw new Error("Unable to retrieve items");
        }

        for (const item of cartItems) {
            const product = await sqlProduct.findOne({
                where: { productNo: item.dataValues.productNo },
                transaction: sqlTransaction,
            });
            if (product) {
                const inventory = await sqlInventory.findOne({
                    where: { product_id: product.dataValues.id },
                    transaction: sqlTransaction,
                });
                let newReserved;
                if (inventory) {
                    if (
                        inventory.dataValues.reserved >=
                        item.dataValues.quantity
                    ) {
                        newReserved =
                            inventory.dataValues.reserved -
                            item.dataValues.quantity;
                    } else {
                        newReserved = 0;
                    }
                    await inventory.update(
                        { reserved: newReserved },
                        { transaction: sqlTransaction }
                    );

                    await item.update(
                        { reserved: false },
                        { transaction: sqlTransaction }
                    );
                } else {
                    throw new Error("Unable to find inventory record");
                }
            } else {
                throw new Error("product not found");
            }
        }
        await sqlTransaction.commit();
        return true;
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error holding stock: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while placing hold on stock"
            );
        }
    }
};

export const updateStockLevels = async (
    updateData: Record<string, number>,
    filters: AdminFilterObj
) => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();
    const sqlTransaction = await sequelize.transaction();
    console.log("starting update function");
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

        // Update Mongo Records
        const bulkOps = productNos.map((productNo) => ({
            updateOne: {
                filter: { productNo },
                update: { $set: { stock: updateData[productNo] } },
            },
        }));
        const result = await Product.bulkWrite(bulkOps, { session });

        await session.commitTransaction();
        await sqlTransaction.commit();

        const productsUpdate = await getAdminProducts(filters);

        return productsUpdate;
    } catch (error) {
        await session.abortTransaction();
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error updating stock levels: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while updating stock levels"
            );
        }
    } finally {
        session.endSession();
    }
};

export const syncStockLevels = async () => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();
    try {
        const allProducts = await sqlInventory.findAll({
            attributes: [[sequelize.literal("stock - reserved"), "available"]],
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
                    productNo: record.dataValues.Product.dataValues.productNo,
                },
                update: { $set: { stock: record.dataValues.available } },
            },
        }));

        const result = await Product.bulkWrite(bulkUpdates, { session });
        console.log("Bulk update result:", result);

        return {
            statusCode: 200,
            body: JSON.stringify({ status: "Complete" }),
        };
    } catch (error) {
        await session.abortTransaction();
        console.error("error during execution:", error);
        return { statusCode: 500, body: error };
    }
};
