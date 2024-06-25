import Product from "../models/mongo/productModel";
import Category from "../models/mongo/categoryModel";
import * as productService from "../services/productService";
import * as promotionService from "../services/promotionService";

////////////////////////
//Types and Interfaces//
////////////////////////

import {
    ProductItem,
    Promotion,
    Attributes,
} from "../models/mongo/productModel";
import { Request, Response, RequestHandler } from "express";
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

interface SearchOptions extends Response {
    searchOptions: Array<{
        display: string;
        value: string;
        id: number;
        url: string;
    }>;
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
        color?: productService.Color[];
        material?: productService.Material[];
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

export const getProducts = async (req: ProductGetRequest, res: Response) => {
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

export const getOneProduct = async (
    req: ProductParamsRequest,
    res: Response
) => {
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

export const getSearchOptions: RequestHandler = async (
    req: Request,
    res: Response
) => {
    try {
        const results = await productService.getSearchOptions();

        (res as SearchOptions).json({
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

export const getProductsInPromotion = async (
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

export const createProduct = async (
    req: CreateProductRequest,
    res: Response
) => {
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

export const deleteProduct = async (
    req: ProductParamsRequest,
    res: Response
) => {
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

export const updateProductDetails = async (
    req: UpdateProductDetailsRequest,
    res: Response
) => {
    try {
        const updateData: any = { ...req.body };
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

export const updateProductPrice = async (
    req: UpdatePriceRequest,
    res: Response
) => {
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

export const updateProductStock = async (
    req: UpdateStockRequest,
    res: Response
) => {
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
