import Product from "../models/mongo/productModel.js";
import Category from "../models/mongo/categoryModel.js";
import generatePromoNo from "../utils/generatePromoNo.js";
import mongoose from "mongoose";

import { ClientSession } from "mongoose";
import { ProductItem, Promotion } from "../models/mongo/productModel.js";
import { CreatePromo } from "../controllers/promotionController.js";
import { Types } from "mongoose";

type PromoUpdate = Partial<Promotion>;
type BooleString = { success: boolean; message: string };
interface CreateArgs {
    promotion: CreatePromo;
    products?: string[];
    categories?: string[];
}
interface DeleteArgs {
    promotion: string;
    products?: string[];
    categories?: string[];
}

export const getAllPromotions = async (req: Request, res: Response) => {
    //Fetch all promos from SQL
};

export const getOnePromotion = async (req: Request, res: Response) => {
    //Fetch promo data from SQL
};

//get all products in a promotion
export const getProductsInPromotion = async (
    promoNum: string
): Promise<ProductItem[]> => {
    //insert logic to check SQL and ensure promoNum is valid

    const productArray = await Product.find({ "promotions.promoId": promoNum });

    if (!productArray) {
        throw new Error("No products found matching criteria");
    }

    return productArray;
};

export const createPromotion = async (
    args: CreateArgs
): Promise<BooleString | BooleString[]> => {
    const promotion = args.promotion;
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();
    try {
        const promoId = generatePromoNo();

        //Construct SQL promo
        let promo;
        //Add promo to SQL

        if (args.products || args.categories) {
            const newMongoPromo: Promotion = {
                ...promotion,
                startDate: String(new Date(promotion.startDate)),
                endDate: String(new Date(promotion.endDate)),
                promoId: promoId,
            };
            let result = [
                {
                    success: true,
                    message: `Successfully created promo ${promoId}`,
                },
            ];
            if (args.products) {
                const prodResult = await addProductsToPromo(
                    newMongoPromo,
                    args.products,
                    session
                );
                result.push(prodResult);
            }
            if (args.categories) {
                const catResult = await addCategoriesToPromo(
                    newMongoPromo,
                    args.categories,
                    session
                );
                result.push(catResult);
            }
            await session.commitTransaction;
            return result;
        }

        await session.commitTransaction();
        return {
            success: true,
            message: `Successfully created promo ${promoId}`,
        };
    } catch (error) {
        await session.abortTransaction();
        if (error instanceof Error) {
            throw new Error("Error adding promotion: " + error.message);
        } else {
            throw new Error("An unknown error occurred while adding promotion");
        }
    } finally {
        await session.endSession();
    }
};

export const addProductsToPromo = async (
    promotion: string | Promotion,
    productNos: string[],
    passedSession?: ClientSession
): Promise<{ success: boolean; message: string }> => {
    const ownSession = !passedSession;
    let session: ClientSession;
    let promo: Promotion;

    if (ownSession) {
        session = await mongoose.startSession();
        session.startTransaction();
    } else {
        session = passedSession;
    }

    try {
        if (typeof promotion === "string") {
            // SQL verify promo number is valid and fetch data
            // Add product to promotion in SQL
            // Add promotion to product in Mongo
            promo = {
                promoId: "i'm",
                name: "just",
                description: "a",
                discountType: "fixed",
                discountValue: 1,
                startDate: "placeholder",
                endDate: "right?",
                active: true,
            };
        } else {
            promo = promotion;
        }

        // Add product nos to SQL

        const result = await Product.updateMany(
            { productNo: { $in: productNos } },
            { $push: { promotions: promo } }
        ).session(session);

        if (result.matchedCount === 0) {
            throw new Error("No products matched productNos provided");
        }
        if (result.matchedCount < productNos.length) {
            throw new Error(
                `${
                    productNos.length - result.matchedCount
                } productNos were invalid.`
            );
        }
        if (result.modifiedCount === 0) {
            throw new Error("Failed to update product records");
        }

        if (ownSession) {
            await session.commitTransaction();
        }
        return {
            success: true,
            message: `Successfully added ${result.modifiedCount} product(s) to promotion.`,
        };
    } catch (error) {
        if (ownSession) {
            await session.abortTransaction();
        }
        if (error instanceof Error) {
            throw new Error(
                "Error adding products to promotion: " + error.message
            );
        } else {
            throw new Error(
                "An unknown error occurred while adding products to promotion"
            );
        }
    } finally {
        if (ownSession) {
            await session.endSession();
        }
    }
};

//add promotion to all products in a category
export const addCategoriesToPromo = async (
    promotion: string | Promotion,
    categoryNames: string[],
    passedSession?: ClientSession
): Promise<{ success: boolean; message: string }> => {
    const ownSession = !passedSession;
    let session: ClientSession;
    let promo: Promotion;

    if (ownSession) {
        session = await mongoose.startSession();
        session.startTransaction();
    } else {
        session = passedSession;
    }

    try {
        const categoryIdArr: Array<{ _id: Types.ObjectId }> =
            await Category.find({ name: { $in: categoryNames } })
                .select("_id")
                .session(session)
                .lean()
                .exec();

        const ids = categoryIdArr.map((item) => item._id);

        if (ids.length < categoryNames.length) {
            throw new Error("One or more category names were invalid");
        }

        if (typeof promotion === "string") {
            // SQL verify promo number is valid and fetch data
            // Add product to promotion in SQL
            // Add promotion to product in Mongo
            promo = {
                promoId: "i'm",
                name: "just",
                description: "a",
                discountType: "fixed",
                discountValue: 1,
                startDate: "placeholder",
                endDate: "right?",
                active: true,
            };
        } else {
            promo = promotion;
        }

        // Add product nos to SQL

        const result = await Product.updateMany(
            { category: { $in: ids } },
            { $push: { promotions: promo } }
        ).session(session);

        if (result.matchedCount === 0) {
            throw new Error("No products found in provided categories");
        }

        if (result.modifiedCount === 0) {
            throw new Error("Failed to update product records");
        }

        if (ownSession) {
            await session.commitTransaction();
        }
        return {
            success: true,
            message: `Successfully added ${result.modifiedCount} product(s) from ${categoryNames.length} category/categories to promotion.`,
        };
    } catch (error) {
        if (ownSession) {
            await session.abortTransaction();
        }
        if (error instanceof Error) {
            throw new Error(
                "Error adding products to promotion: " + error.message
            );
        } else {
            throw new Error(
                "An unknown error occurred while adding products to promotion"
            );
        }
    } finally {
        if (ownSession) {
            await session.endSession();
        }
    }
};

//update promotion
export const updatePromo = async (
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

    const session: ClientSession = await mongoose.startSession();
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
        await session.endSession();
    }
};

export const deletePromotion = async (
    args: DeleteArgs
): Promise<BooleString> => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();
    try {
        if (args.products) {
            await removeProductsFromPromo(
                args.promotion,
                args.products,
                session
            );
        }
        if (args.categories) {
            const catResult = await removeCategoriesFromPromo(
                args.promotion,
                args.categories,
                session
            );
        }

        // Remove from SQL

        await session.commitTransaction();
        return {
            success: true,
            message: `Successfully deleted promo ${args.promotion}`,
        };
    } catch (error) {
        await session.abortTransaction();
        if (error instanceof Error) {
            throw new Error("Error deleting promotion: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while deleting promotion"
            );
        }
    } finally {
        await session.endSession();
    }
};

export const removeProductsFromPromo = async (
    promotion: string,
    productNos: string[],
    passedSession?: ClientSession
): Promise<{ success: boolean; message: string }> => {
    const ownSession = !passedSession;
    let session: ClientSession;
    let promo: Promotion;

    if (ownSession) {
        session = await mongoose.startSession();
        session.startTransaction();
    } else {
        session = passedSession;
    }

    try {
        // Remove product nos to SQL

        const result = await Product.updateMany(
            { productNo: { $in: productNos } },
            { $pull: { promotions: promotion } }
        ).session(session);

        if (result.matchedCount === 0) {
            throw new Error("No products matched productNos provided");
        }
        if (result.matchedCount < productNos.length) {
            throw new Error(
                `${
                    productNos.length - result.matchedCount
                } productNos were invalid.`
            );
        }
        if (result.modifiedCount === 0) {
            throw new Error("Failed to update product records");
        }

        if (ownSession) {
            await session.commitTransaction();
        }
        return {
            success: true,
            message: `Successfully removed ${result.modifiedCount} product(s) from promotion.`,
        };
    } catch (error) {
        if (ownSession) {
            await session.abortTransaction();
        }
        if (error instanceof Error) {
            throw new Error(
                "Error removing products from promotion: " + error.message
            );
        } else {
            throw new Error(
                "An unknown error occurred while removing products from promotion"
            );
        }
    } finally {
        if (ownSession) {
            await session.endSession();
        }
    }
};

//add promotion to all products in a category
export const removeCategoriesFromPromo = async (
    promotion: string,
    categoryNames: string[],
    passedSession?: ClientSession
): Promise<{ success: boolean; message: string }> => {
    const ownSession = !passedSession;
    let session: ClientSession;
    let promo: Promotion;

    if (ownSession) {
        session = await mongoose.startSession();
        session.startTransaction();
    } else {
        session = passedSession;
    }

    try {
        const categoryIdArr: Array<{ _id: Types.ObjectId }> =
            await Category.find({ name: { $in: categoryNames } })
                .select("_id")
                .session(session)
                .lean()
                .exec();

        const ids = categoryIdArr.map((item) => item._id);

        if (ids.length < categoryNames.length) {
            throw new Error("One or more category names were invalid");
        }

        //Remove from sql

        const result = await Product.updateMany(
            { category: { $in: ids } },
            { $pull: { promotions: promotion } }
        ).session(session);

        if (result.matchedCount === 0) {
            throw new Error("No products found in provided categories");
        }

        if (result.modifiedCount === 0) {
            throw new Error("Failed to update product records");
        }

        if (ownSession) {
            await session.commitTransaction();
        }
        return {
            success: true,
            message: `Successfully removed ${result.modifiedCount} product(s) from ${categoryNames.length} category/categories to promotion.`,
        };
    } catch (error) {
        if (ownSession) {
            await session.abortTransaction();
        }
        if (error instanceof Error) {
            throw new Error(
                "Error removing products from promotion: " + error.message
            );
        } else {
            throw new Error(
                "An unknown error occurred while removing products from promotion"
            );
        }
    } finally {
        if (ownSession) {
            await session.endSession();
        }
    }
};
