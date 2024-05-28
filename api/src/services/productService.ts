const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const generateProductNo = require("../utils/generateProductNo");
import { ProductItem } from "../models/productModel";

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

//update basic product details (name, description, images)

//update product stock

//update product price

//update product categories

//delete single product category

//add single product category

//delete single product
