const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const generatePromoNo = require("../utils/generatePromoNo");
const mongoose = require("mongoose");

import { ClientSession } from "mongoose";
import { Promotion } from "../models/productModel";
import { CreatePromo } from "../controllers/productController";

type PromoUpdate = Partial<Promotion>;

//get all products in a promotion
exports.getProductsInPromotion = async (promoNum: string) => {
    //insert logic to check SQL and ensure promoNum is valid

    const productArray = await Product.find({ "promotions.promoId": promoNum });

    if (!productArray) {
        throw new Error("No products found matching criteria");
    }

    return productArray;
};

//add promotion to a single product
exports.addProductPromo = async (
    target: number,
    promotion: string | CreatePromo
) => {
    const productToUpdate = await Product.findOne({ productNo: target });

    if (!productToUpdate) {
        throw new Error("Product not found");
    }

    const session: ClientSession = mongoose.startSession();
    session.startTransaction();
    try {
        if (typeof promotion === "string") {
            // Fetch existing promotion data from SQL
            // Add product to promotion in SQL
            // Add promotion to product in Mongo
        }
        if (typeof promotion === "object") {
            // Create new promotion and add to product
            const newPromo: Promotion = {
                ...promotion,
                startDate: String(new Date(promotion.startDate)),
                endDate: String(new Date(promotion.endDate)),
                promoId: generatePromoNo(),
            };
            productToUpdate.promotions.push(newPromo);
            await productToUpdate.save({ session });
        }

        await session.commitTransaction();
        return productToUpdate;
    } catch (error) {
        await session.abortTransaction();
        if (error instanceof Error) {
            throw new Error("Error adding promotion: " + error.message);
        } else {
            throw new Error("An unknown error occurred while adding promotion");
        }
    } finally {
        session.endSession();
    }
};

//add promotion to all products in a category
exports.addPromoByCategory = async (
    target: string,
    promotion: string | CreatePromo
): Promise<{ success: boolean }> => {
    const category = await Category.findOne({ name: target });

    if (!category) {
        throw new Error("Category not found");
    }

    const categoryId = category._id;

    const session: ClientSession = mongoose.startSession();
    session.startTransaction();
    try {
        if (typeof promotion === "string") {
            // Fetch existing promotion data from SQL
            let promoToAdd;
            // Add product to promotion in SQL
            // Add promotion to product in Mongo
            await Product.updateMany(
                { category: categoryId },
                { $push: { promotion: promoToAdd } }
            ).session(session);
        }
        if (typeof promotion === "object") {
            // Create new promotion and add to product
            const newPromo: Promotion = {
                ...promotion,
                startDate: String(new Date(promotion.startDate)),
                endDate: String(new Date(promotion.endDate)),
                promoId: generatePromoNo(),
            };

            await Product.updateMany(
                { category: categoryId },
                { $push: { promotion: newPromo } }
            ).session(session);
        }

        await session.commitTransaction();
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        if (error instanceof Error) {
            throw new Error("Error adding promotion: " + error.message);
        } else {
            throw new Error("An unknown error occurred while adding promotion");
        }
    } finally {
        session.endSession();
    }
};

//update promotion
exports.updatePromo = async (
    promoId: string,
    updatedData: PromoUpdate
): Promise<{ success: boolean }> => {
    //Verify with SQL that promoNumber exists

    function isPromoUpdateKey(key: string): key is keyof PromoUpdate {
        return [
            "description",
            "discountType",
            "discountValue",
            "startDate",
            "endDate",
            "active",
        ].includes(key);
    }

    const session: ClientSession = mongoose.startSession();
    session.startTransaction();
    try {
        //Creates new object with correct prefix to ensure that update only affects the particular promotion and not all promotions in an object's array.
        const updateObject: { [key: string]: any } = {};
        for (const key in updatedData) {
            if (updatedData.hasOwnProperty(key) && isPromoUpdateKey(key)) {
                updateObject[`promotions.$.${key}`] = updatedData[key];
            }
        }

        await Product.updateMany(
            { "promotions.promoId": promoId },
            { $set: updateObject }
        ).session(session);

        //Update SQL

        await session.commitTransaction();
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        if (error instanceof Error) {
            throw new Error("Error updating promotion: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while updating promotion"
            );
        }
    } finally {
        session.endSession();
    }
};

//delete promotion attached to a single product

exports.removePromoFromProduct = async (
    target: string,
    promoId: string
): Promise<{ success: boolean }> => {
    const session: ClientSession = mongoose.startSession();
    session.startTransaction();
    try {
        const result = await Product.updateOne(
            { productNo: target },
            { $pull: { promotions: { promoId: promoId } } }
        ).session(session);

        if (result.matchedCount === 0) {
            throw new Error("Product not found");
        }

        if (result.modifiedCount === 0) {
            throw new Error("Product does not have this promotion");
        }

        //update SQL

        await session.commitTransaction();
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        if (error instanceof Error) {
            throw new Error(
                "Error removing promo from product: " + error.message
            );
        } else {
            throw new Error(
                "An unknown error occurred while removing promo from product"
            );
        }
    } finally {
        session.endSession();
    }
};

//delete promotion attached to a single category
exports.removePromoFromCategory = async (
    target: string,
    promoId: string
): Promise<{ success: boolean }> => {
    const session: ClientSession = mongoose.startSession();
    session.startTransaction();

    const targetCategory = await Category.findOne({ name: target });

    if (!targetCategory) {
        throw new Error("Cannot find category");
    }

    const categoryId = targetCategory._id;

    try {
        const result = await Product.updateMany(
            { category: categoryId },
            { $pull: { promotions: { promoId: promoId } } }
        ).session(session);

        if (result.matchedCount === 0) {
            throw new Error("No products found in the specified category");
        }

        if (result.modifiedCount === 0) {
            throw new Error(
                "Promotion not found in any products of the specified category"
            );
        }

        //update SQL

        await session.commitTransaction();
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        if (error instanceof Error) {
            throw new Error(
                "Error removing promo from product: " + error.message
            );
        } else {
            throw new Error(
                "An unknown error occurred while removing promo from product"
            );
        }
    } finally {
        session.endSession();
    }
};
