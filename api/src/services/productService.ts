const Product = require("../models/mongo/productModel");
const Category = require("../models/mongo/categoryModel");
const sqlCategory = require("../models/mysql/sqlCategoryModel");
const sqlProduct = require("../models/mysql/sqlProductModel");
const sqlInventory = require("../models/mysql/sqlInventoryModel");
const sqlProductCategory = require("../models/mysql/sqlProductCategoryModel");
const generateProductNo = require("../utils/generateProductNo");

// Types and interfaces
import { ClientSession } from "mongoose";
import { Types } from "mongoose";
import { ProductItem } from "../models/mongo/productModel";
import { CreateProduct } from "../controllers/productController";
type BooleString = { success: boolean; message: string };

//get all products
exports.getAllProducts = async () => {
    let results: Array<ProductItem> = await Product.find({});
    if (!results) {
        throw new Error("No products found");
    }

    return results;
};

//get one product

exports.getOneProduct = async (productNo: string) => {
    let result: ProductItem = await Product.findOne({ productNo: productNo });
    if (!result) {
        throw new Error("Product not found");
    }

    return result;
};

//get products by category

exports.getProductsByCategory = async (categoryName: string) => {
    const categoryId = Category.findOne({ name: categoryName });
    if (!categoryId) {
        throw new Error("Category not found");
    }

    let results: Array<ProductItem> = await Product.findOne({
        category: categoryId,
    });
    if (!results) {
        throw new Error("No products found");
    }

    return results;
};

exports.createProduct = async (
    productData: CreateProduct
): Promise<BooleString> => {
    const session: ClientSession = mongoose.startSession();
    session.startTransaction();
    try {
        const {
            name,
            category,
            prefix,
            description,
            price,
            stock = 0,
            images = [],
        } = productData;
        const productNo = generateProductNo(prefix);

        //Construct SQL product
        const abbrDesc = description.substring(0, 79) + "...";
        const newProduct = await sqlProduct.create({
            productNo,
            productName: name,
            description: abbrDesc,
            price,
        });

        // add SQL categories
        for (const categoryName of category) {
            const category = await sqlCategory.findOne({
                where: { categoryName },
            });
            if (category) {
                await sqlProductCategory.create({
                    categoryName: category.categoryName,
                    productNo: newProduct.productNo,
                });
            }
        }

        // create SQL inventory record
        await sqlInventory.create({
            productNo: newProduct.productNo,
            stock: stock,
        });

        // MongoDB operations
        const categoryIds = await Promise.all(
            category.map(async (catName): Promise<Types.ObjectId | null> => {
                const categoryDoc = await Category.findOne({ name: catName });
                return categoryDoc ? categoryDoc._id : null;
            })
        );

        const validCategoryIds: Types.ObjectId[] = categoryIds.filter(
            (id): id is Types.ObjectId => id != null
        );

        const newMongoProduct: ProductItem = await Product.create({
            productNo: productNo,
            name: name,
            category: validCategoryIds,
            description: description,
            price: price,
            promotions: [],
            stock: stock,
            images: images,
        });

        await session.commitTransaction();
        return {
            success: true,
            message: `Product successfully added to databases`,
        };
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

//update basic product details (name, description, images)

//update product stock

//update product price

//delete single product
//also delete from sql in all locations
