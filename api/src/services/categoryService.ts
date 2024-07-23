import mongoose from "mongoose";
import Category, {
    CategoryItem,
    SubCategoryItem,
} from "../models/mongo/categoryModel.js";
import Product from "../models/mongo/productModel.js";

//types and interfaces
import { ClientSession } from "mongoose";
import { ProductItem } from "../models/mongo/productModel.js";
import { sqlCategory } from "../models/mysql/sqlCategoryModel.js";
import { BooleString } from "../../types/api_resp.js";
import { sqlSubCategory } from "../models/mysql/sqlSubCategoryModel.js";
import sequelize from "../models/mysql/index.js";

export const getAllCategories = async (): Promise<
    Array<{
        categoryName: string;
        productCount: number;
        Subcategory: Array<{ subCategoryName: string; productCount: number }>;
    }>
> => {
    const categoriesAndCounts = await sqlCategory.findAll({
        attributes: [
            "categoryName",
            [
                sequelize.literal(`(
                SELECT COUNT(*)
                FROM Products AS Product
                WHERE
                    Product.category_id = sqlCategory.category_id
                )`),
                "productCount",
            ],
        ],
        include: [
            {
                model: sqlSubCategory,
                as: "SubCategory",
                attributes: [
                    "subCategoryName",
                    [
                        sequelize.literal(`(
                        SELECT COUNT(*)
                        FROM Products AS Product
                        WHERE
                          Product.subCategory_id = SubCategory.subCategory_id
                      )`),
                        "productCount",
                    ],
                ],
            },
        ],
    });

    if (!categoriesAndCounts) {
        throw new Error("No categories found");
    }

    const parsedCategoriesAndCounts = categoriesAndCounts.map((category) => {
        const parsedCategory = category.get();
        if (parsedCategory.SubCategory) {
            const parsedSubCategories = parsedCategory.SubCategory.map(
                (subCategory: any) => subCategory.get()
            );
            parsedCategory.SubCategory = parsedSubCategories;
        }
        return parsedCategory;
    });

    return parsedCategoriesAndCounts;
};

export const getCategoryByName = async (
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

export const createCategory = async (
    categoryName: string
): Promise<BooleString> => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();
    const sqlTransaction = await sequelize.transaction();

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
        await sqlCategory.create(
            { categoryName: categoryName },
            { transaction: sqlTransaction }
        );

        await session.commitTransaction();
        await sqlTransaction.commit();
        return { success: true, message: "Category successfully created" };
    } catch (error) {
        await session.abortTransaction();
        await sqlTransaction.rollback();
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

export const createSubCategory = async (
    categoryName: string,
    subCategoryName: string
): Promise<BooleString> => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();
    const sqlTransaction = await sequelize.transaction();

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
            category_id: sqlCatRec.dataValues.category_id,
        });

        await session.commitTransaction();
        await sqlTransaction.commit();
        return { success: true, message: "subcategory successfully created" };
    } catch (error) {
        await session.abortTransaction();
        await sqlTransaction.rollback();
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

// update category name

export const updateCategoryName = async (
    oldName: string,
    newName: string
): Promise<BooleString> => {
    const targetCategory = await Category.findOne({ name: oldName });

    if (!targetCategory) {
        throw new Error("Category not found");
    }

    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();
    const sqlTransaction = await sequelize.transaction();

    try {
        // avoid inputting undefined values
        let updatedData = {
            name: newName ? newName : targetCategory.name,
        };

        const updatedCategory = await Category.findOneAndUpdate(
            { name: oldName },
            { $set: updatedData },
            { upsert: true, new: true, session: session }
        );

        //SQL Update Function
        const foundSqlCat = await sqlCategory.findOne({
            where: { categoryName: oldName },
            transaction: sqlTransaction,
        });

        if (!foundSqlCat) {
            throw new Error("Old category name not found in sql database");
        }

        foundSqlCat.categoryName = newName;
        await foundSqlCat.save();

        await session.commitTransaction();
        await sqlTransaction.commit();
        return {
            success: true,
            message: `The name of the category ${oldName} has been changed to ${newName}`,
        };
    } catch (error) {
        await session.abortTransaction();
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error updating category: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while updating category"
            );
        }
    } finally {
        session.endSession();
    }
};

// update category name

export const updateSubcategoryName = async (
    oldName: string,
    newName: string
): Promise<BooleString> => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();
    const sqlTransaction = await sequelize.transaction();

    try {
        await Category.findOneAndUpdate(
            { "subCategories.name": oldName },
            { $set: { "subCategories.$[elem].name": newName } },
            { arrayFilters: [{ "elem.name": oldName }], session }
        );

        //SQL Update Function
        const foundSqlSubcat = await sqlSubCategory.findOne({
            where: { subCategoryName: oldName },
            transaction: sqlTransaction,
        });

        if (!foundSqlSubcat) {
            throw new Error("Old subcategory name not found in sql database");
        }
        await sqlSubCategory.update(
            { subCategoryName: newName },
            {
                where: { subCategoryName: oldName },
                transaction: sqlTransaction,
            }
        );

        await session.commitTransaction();
        await sqlTransaction.commit();
        return {
            success: true,
            message: `The name of the subcategory ${oldName} has been changed to ${newName}`,
        };
    } catch (error) {
        await session.abortTransaction();
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error updating subcategory: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while updating subcategory"
            );
        }
    } finally {
        session.endSession();
    }
};
//delete category only if it contains no products

export const deleteCategory = async (
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
    const sqlTransaction = await sequelize.transaction();

    try {
        session.startTransaction();
        // Delete from Mongo
        await Category.deleteOne({ name: categoryName }, { session });

        // Delete from SQL
        const foundSqlCat = await sqlCategory.findOne({
            where: { categoryName: categoryName },
        });
        if (!foundSqlCat) {
            throw new Error("Category not found");
        }

        await sqlSubCategory.destroy({
            where: { category_id: foundSqlCat.dataValues.category_id },
        });

        await sqlCategory.destroy({
            where: { categoryName: categoryName },
            transaction: sqlTransaction,
        });

        await session.commitTransaction();
        await sqlTransaction.commit();
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        await sqlTransaction.rollback();
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

export const deleteSubcategory = async (
    subcategoryName: string
): Promise<{ success: boolean }> => {
    const targetCategory: CategoryItem | null = await Category.findOne(
        {
            subCategories: { $elemMatch: { name: subcategoryName } },
        },
        {
            // return only matched subcategory
            "subCategories.$": 1,
        }
    ).exec();
    if (
        !targetCategory ||
        !targetCategory.subCategories ||
        targetCategory.subCategories.length === 0
    ) {
        throw new Error("Category not found");
    }

    console.log("targetCategory:", targetCategory);
    const subCategoryId = targetCategory.subCategories[0]._id.toString();

    console.log(subCategoryId);

    const session: ClientSession = await mongoose.startSession();
    const sqlTransaction = await sequelize.transaction();

    try {
        session.startTransaction();

        await Product.updateMany(
            { subCategory: subCategoryId },
            { $pull: { subCategory: subCategoryId } },
            { session }
        );
        // Delete from Mongo
        console.log("Deleting from mongo");
        const result = await Category.updateOne(
            { _id: targetCategory._id },
            { $pull: { subCategories: { name: subcategoryName } } },
            { session }
        );

        console.log("result:", result);
        // Delete from SQL

        await sqlSubCategory.destroy({
            where: { subCategoryName: subcategoryName },
            transaction: sqlTransaction,
        });

        await session.commitTransaction();
        await sqlTransaction.commit();
        return { success: true };
    } catch (error) {
        await session.abortTransaction();
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error deleting subcategory :" + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while deleting subcategory"
            );
        }
    } finally {
        session.endSession();
    }
};
