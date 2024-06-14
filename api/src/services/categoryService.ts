const mongoose = require("mongoose");
import Category, {
    CategoryItem,
    SubCategoryItem,
} from "../models/mongo/categoryModel";
const Product = require("../models/mongo/productModel");

//types and interfaces
import { ClientSession } from "mongoose";
import { ProductItem } from "../models/mongo/productModel";
import { sqlCategory } from "../models/mysql/sqlCategoryModel";
import { BooleString } from "../../types/api_resp";
import { sqlSubCategory } from "../models/mysql/sqlSubCategoryModel";

exports.getAllCategories = async (): Promise<
    Array<{ name: string; subCategories: string[] }>
> => {
    const categories: Array<CategoryItem> = await Category.find({});
    if (!categories) {
        throw new Error("No categories found");
    }

    const categoryArray: Array<{ name: string; subCategories: string[] }> =
        categories.map((category) => {
            const catName = category.name;
            const subCats = category.subCategories.map(
                (subCategory) => subCategory.name
            );
            return { name: catName, subCategories: subCats };
        });

    return categoryArray;
};

exports.getCategoryByName = async (
    categoryName: string
): Promise<CategoryItem> => {
    const foundCategory = await Category.findOne({
        name: categoryName,
    });

    if (!foundCategory) {
        throw new Error("Category not found");
    }

    return foundCategory;
};
//create category

exports.createCategory = async (categoryName: string): Promise<BooleString> => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
        await Category.create(
            [
                {
                    name: categoryName,
                },
            ],
            { session }
        );

        //SQL create category
        await sqlCategory.create({ categoryName: categoryName });

        await session.commitTransaction();
        return { success: true, message: "Category successfully created" };
    } catch (error) {
        await session.abortTransaction();
        if (error instanceof Error) {
            throw new Error("Error creating category: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while creating category"
            );
        }
    } finally {
        session.endSession();
    }
};

//create subcategory

exports.createSubCategory = async (
    categoryName: string,
    subCategoryName: string
): Promise<BooleString> => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
        // Get category subcategory belongs to
        const categoryDoc = await Category.findOne({ name: categoryName });
        if (!categoryDoc) {
            throw new Error("category does not exist in MongoDB database");
        }

        // construct subcategory in required format
        const subCategory: SubCategoryItem = {
            _id: new mongoose.Types.ObjectId(),
            name: subCategoryName,
        };

        categoryDoc.subCategories.push(subCategory);

        await categoryDoc.save({ session });

        //SQL create category
        const sqlCatRec = await sqlCategory.findOne({
            where: { categoryName: categoryName },
        });
        if (!sqlCatRec) {
            throw new Error("category does not exist");
        }

        await sqlSubCategory.create({
            subCategoryName: subCategoryName,
            category_id: sqlCatRec.category_id,
        });

        await session.commitTransaction();
        return { success: true, message: "subcategory successfully created" };
    } catch (error) {
        await session.abortTransaction();
        if (error instanceof Error) {
            throw new Error("Error creating category: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while creating category"
            );
        }
    } finally {
        session.endSession();
    }
};

//update category name

// exports.updateCategoryName = async (
//     oldName: string,
//     newName: string
// ): Promise<CategoryItem> => {
//     const targetCategory = await Category.findOne({ name: oldName });

//     if (!targetCategory) {
//         throw new Error("Category not found");
//     }

//     const session: ClientSession = await mongoose.startSession();
//     session.startTransaction();

//     try {
//         // ternaries avoid inputting undefined values
//         let updatedData = {
//             name: newName ? newName : targetCategory.name,
//         };

//         const updatedCategory = await Category.updateOne(
//             { name: oldName },
//             { $set: updatedData },
//             { upsert: true }
//         ).session(session);

//         //SQL Update Function

//         await session.commitTransaction();
//         return updatedCategory;
//     } catch (error) {
//         await session.abortTransaction();
//         if (error instanceof Error) {
//             throw new Error("Error updating category: " + error.message);
//         } else {
//             throw new Error(
//                 "An unknown error occurred while updating category"
//             );
//         }
//     } finally {
//         session.endSession();
//     }
// };

//delete category (must delete category from all products as well)

exports.deleteCategory = async (
    categoryName: string
): Promise<{ success: boolean }> => {
    const targetCategory: CategoryItem | null = await Category.findOne({
        name: categoryName,
    });
    if (!targetCategory) {
        throw new Error("Category not found");
    }

    const categoryId = targetCategory._id;

    //Check to make sure deleting category would not leave any orphaned products. If it would, prevent deletion.

    const productsArr: Array<ProductItem> = await Product.find({
        category: categoryId,
        $expr: { $eq: [{ $size: "$category" }, 1] },
    }).exec();

    if (productsArr.length > 0) {
        throw new Error(
            `Cannot delete. Deleting category would leave ${productsArr.length} product(s) without a category.`
        );
    }

    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
        await Product.updateMany(
            { category: categoryId },
            { $pull: { category: categoryId } }
        ).session(session);

        await Category.deleteOne({ name: categoryName }).session(session);

        // Delete from SQL HERE

        await session.commitTransaction();
        return { success: true };
    } catch (error) {
        await session.abortTransaction();

        if (error instanceof Error) {
            throw new Error("Error deleting category :" + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while deleting category"
            );
        }
    } finally {
        session.endSession();
    }
};
