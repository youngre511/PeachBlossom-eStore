const mongoose = require("mongoose");
const Category = require("../models/categoryModel");
const Product = require("../models/productModel");

//types and interfaces
import { ClientSession } from "mongoose";
import { CategoryItem } from "../models/categoryModel";
import { ProductItem } from "../models/productModel";

exports.getAllCategories = async () => {
    const categoryArray: Array<CategoryItem> = await Category.find({});

    if (!categoryArray) {
        throw new Error("No categories found");
    }

    return categoryArray;
};

exports.getCategoryById = async (categoryId: string) => {
    const foundCategory: CategoryItem = await Category.findById({ categoryId });

    if (!foundCategory) {
        throw new Error("Category not found");
    }

    return foundCategory;
};

exports.getCategoryByName = async (categoryName: string) => {
    const foundCategory: CategoryItem = await Category.findOne({
        name: categoryName,
    });

    if (!foundCategory) {
        throw new Error("Category not found");
    }

    return foundCategory;
};
//create category

exports.createCategory = async (categoryName: string) => {
    const category: CategoryItem = await Category.create({
        name: categoryName,
    });
    if (!category) {
        throw new Error("Failure to create category");
    }

    return category;
};

//update category name

exports.updateCategoryName = async (oldName: string, newName: string) => {
    const targetCategory = await Category.findOne({ name: oldName });

    // ternaries avoid inputting undefined values
    let updatedData = {
        name: newName ? newName : targetCategory.name,
    };

    const updatedCategory: CategoryItem = await Category.updateOne(
        { name: oldName },
        { $set: updatedData },
        { upsert: true }
    );

    if (!updatedCategory) {
        throw new Error("Failed to update category name");
    }

    return updatedCategory;
};

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
            throw new Error("Error deleting category:" + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while deleting category"
            );
        }
    } finally {
        session.endSession();
    }
};
