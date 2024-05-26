const Product = require("../models/productModel");
const generateProductNo = require("../utils/generateProductNo");
const Category = require("../models/categoryModel");

//Types and Interfaces
import { ProductItem } from "../models/productModel";
import { Request, Response } from "express";
import { CategoryItem } from "../models/categoryModel";

interface CreateProductRequest extends Request {
    body: {
        name: string;
        category: Array<string>;
        prefix: string;
        description: string;
        price: number;
        stock?: number;
        images?: Array<string>;
    };
}

interface ProductParamsRequest extends Request {
    params: {
        productNo: string;
    };
}

interface UpdateProductRequest extends Request {
    params: {
        productNo: string;
    };
    body: Partial<{
        productNo: string;
        name: string;
        category: Array<string>;
        description: string;
        price: number;
        stock: number;
        images: Array<string>;
    }>;
}

async function getAllProducts(req: Request, res: Response) {
    try {
        let results = await Product.find({});

        res.json({
            message: "success",
            payload: results,
        });
    } catch (error) {
        let errorObj = {
            message: "get all products failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
}

async function getOneProduct(req: ProductParamsRequest, res: Response) {
    try {
        let result = await Product.findOne({
            productNo: req.params.productNo,
        });

        res.json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "get ONE Product failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
}

async function createProduct(req: CreateProductRequest, res: Response) {
    try {
        // Accepting the front-end form data from the client to generate the document
        const {
            name,
            category,
            prefix,
            description,
            price,
            stock = 0,
            images = [],
        } = req.body;

        //Generate unique product number
        const productNo = generateProductNo(prefix);

        //Find records for all category names in list
        const categories = await Category.find({ name: { $in: category } });
        //extract object ids
        const categoryIds = categories.map((cat: CategoryItem) => cat._id);

        const newProduct = {
            productNo: productNo,
            name: name,
            category: categoryIds,
            description: description,
            price: price,
            stock: stock,
            images: images,
        };

        // post the new document to the Product collection
        const product: ProductItem = await Product.create(newProduct);

        res.json({
            message: "success",
            payload: product,
        });
    } catch (error) {
        let errorObj = {
            message: "create product failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
}

async function deleteProduct(req: ProductParamsRequest, res: Response) {
    try {
        await Product.deleteOne({ productNo: req.params.productNo });

        res.json({
            message: "success",
            payload: req.params.productNo,
        });
    } catch (error) {
        let errorObj = {
            message: "delete product failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
}

async function updateProduct(req: UpdateProductRequest, res: Response) {
    try {
        const updateData = req.body;
        const { productNo } = req.params;

        //Ensure that productNo is not in the update data to preserve immutability
        delete updateData.productNo;

        const updatedProduct = await Product.findOneAndUpdate(
            { productNo },
            updateData,
            { new: true }
        ).exec();

        if (!updatedProduct) {
            res.status(404).json({ message: "Product not found" });
            return;
        }

        res.status(200).json(updatedProduct);
    } catch (error) {
        let errorObj = {
            message: "update one Product failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
}

module.exports = {
    getAllProducts,
    getOneProduct,
    createProduct,
    deleteProduct,
    updateProduct,
};
