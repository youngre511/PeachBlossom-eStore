import { sqlInventory } from "../models/mysql/sqlInventoryModel";
import { sqlCart } from "../models/mysql/sqlCartModel";
import { sqlCartItem } from "../models/mysql/sqlCartItemModel";
import { sqlProduct } from "../models/mysql/sqlProductModel";
import { JoinReqCart } from "./cartService";
import sequelize from "../models/mysql";

exports.holdStock = async (cartId: number) => {
    try {
        const transaction = await sequelize.transaction();

        const cartItems = await sqlCartItem.findAll({
            where: { cart_id: cartId },
            transaction,
        });

        if (!cartItems) {
            throw new Error("Unable to retrieve items");
        }

        for (const item of cartItems) {
            const product = await sqlProduct.findOne({
                where: { productNo: item.productNo },
                transaction,
            });
            if (product) {
                const inventory = await sqlInventory.findOne({
                    where: { product_id: product.id },
                    transaction,
                });
                if (inventory && inventory.available >= item.quantity) {
                    inventory.reserved += item.quantity;
                    await inventory.save({ transaction });
                    item.reserved = true;
                    await item.save({ transaction });
                } else {
                    throw new Error(
                        "Unable to find inventory record or insufficient stock"
                    );
                }
            } else {
                throw new Error("product not found");
            }
        }
        await transaction.commit();
        return true;
    } catch (error) {
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

exports.releaseStock = async (cartId: number) => {
    try {
        const transaction = await sequelize.transaction();

        const cartItems = await sqlCartItem.findAll({
            where: { cart_id: cartId },
            transaction,
        });

        if (!cartItems) {
            throw new Error("Unable to retrieve items");
        }

        for (const item of cartItems) {
            const product = await sqlProduct.findOne({
                where: { productNo: item.productNo },
                transaction,
            });
            if (product) {
                const inventory = await sqlInventory.findOne({
                    where: { product_id: product.id },
                    transaction,
                });
                if (inventory) {
                    if (inventory.reserved >= item.quantity) {
                        inventory.reserved -= item.quantity;
                    } else {
                        inventory.reserved = 0;
                    }
                    await inventory.save({ transaction });
                    item.reserved = false;
                    item.save({ transaction });
                } else {
                    throw new Error("Unable to find inventory record");
                }
            } else {
                throw new Error("product not found");
            }
        }
        await transaction.commit();
        return true;
    } catch (error) {
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
