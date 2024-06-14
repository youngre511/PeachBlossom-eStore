const Product = require("../models/mongo/productModel");
const Category = require("../models/mongo/categoryModel");
const productService = require("../services/productService");
const promotionService = require("../services/promotionService");

////////////////////////
//Types and Interfaces//
////////////////////////

import {
    ProductItem,
    Promotion,
    Attributes,
} from "../models/mongo/productModel";
import { Request, Response } from "express";
import { CategoryItem } from "../models/mongo/categoryModel";

export interface CreateProduct {
    name: string;
    category: string;
    subCategory?: string;
    prefix: string;
    description: string;
    attributes: Attributes;
    price: number;
    stock?: number;
    images?: Array<string>;
    tags?: Array<string>;
}

interface CreateProductRequest extends Request {
    body: CreateProduct;
}

interface ProductParamsRequest extends Request {
    params: {
        productNo: string;
    };
}

interface ProductGetRequest extends Request {
    query: {
        category?: string;
        tags?: string;
        page: string;
        size?: string[];
        color?: string[];
        material?: string[];
        minPrice?: string;
        maxPrice?: string;
        minWidth?: string;
        maxWidth?: string;
        minHeight?: string;
        maxHeight?: string;
        minDepth?: string;
        maxDepth?: string;
        minCircum?: string;
        maxCircum?: string;
        minDiam?: string;
        maxDiam?: string;
        sortMethod: string;
        itemsPerPage: string;
    };
}

interface CategoryParamsRequest extends Request {
    params: {
        categoryName: string;
    };
}

interface PromoParamsRequest extends Request {
    params: {
        promoNum: string;
    };
}

interface UpdateProductDetailsRequest extends Request {
    params: {
        productNo: string;
    };
    body: Partial<{
        name: string;
        category: Array<string>;
        description: string;
        images: Array<string>;
    }>;
}

interface UpdatePriceRequest extends Request {
    params: {
        productNo: string;
    };
    body: {
        price: number;
    };
}

interface UpdateStockRequest extends Request {
    params: {
        productNo: string;
    };
    body: {
        stock: number;
    };
}

////////////////////////
/////GET FUNCTIONS//////
////////////////////////

exports.getProducts = async (req: ProductGetRequest, res: Response) => {
    try {
        const results = await productService.getProducts(req.query);

        res.json({
            message: "success",
            payload: results,
        });
    } catch (error) {
        let errorObj = {
            message: "get products failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

exports.getOneProduct = async (req: ProductParamsRequest, res: Response) => {
    try {
        const { productNo } = req.params;
        const result = await productService.getOneProduct(productNo);

        res.json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "get one product failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

exports.getProductsInPromotion = async (
    req: PromoParamsRequest,
    res: Response
) => {
    try {
        const { promoNum } = req.params;
        const results = await promotionService.getProductsInPromotion(promoNum);

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
};

////////////////////////
/////CREATE FUNCTION////
////////////////////////

exports.createProduct = async (req: CreateProductRequest, res: Response) => {
    try {
        const result = await productService.createProduct(req.body);

        res.status(200).json(result);
    } catch (error) {
        let errorObj = {
            message: "create product failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

////////////////////////
/////DELETE FUNCTION////
////////////////////////

exports.deleteProduct = async (req: ProductParamsRequest, res: Response) => {
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
};

////////////////////////
/////UPDATE FUNCTIONS///
////////////////////////

exports.updateProductDetails = async (
    req: UpdateProductDetailsRequest,
    res: Response
) => {
    try {
        const updateData = req.body;
        const { productNo } = req.params;

        if (updateData.category) {
            let category = updateData.category;
            //find categories by name
            const categories = await Category.find({ name: { $in: category } });
            //extract object ids
            const categoryIds = categories.map((cat: CategoryItem) => cat._id);
            //replace array of category names from request with array of category ids
            updateData.category = categoryIds;
        }

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
            message: "update product details failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

exports.updateProductPrice = async (req: UpdatePriceRequest, res: Response) => {
    try {
        const updateData = req.body;
        const { productNo } = req.params;

        const updatedProduct: ProductItem = await Product.findOneAndUpdate(
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
            message: "update product details failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

exports.updateProductStock = async (req: UpdateStockRequest, res: Response) => {
    try {
        const updateData = req.body;
        const { productNo } = req.params;

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
            message: "update product details failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};
