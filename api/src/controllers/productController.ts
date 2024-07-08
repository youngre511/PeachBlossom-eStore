import Product from "../models/mongo/productModel.js";
import Category from "../models/mongo/categoryModel.js";
import * as productService from "../services/productService.js";
import * as promotionService from "../services/promotionService.js";

////////////////////////
//Types and Interfaces//
////////////////////////

import {
    ProductItem,
    Promotion,
    Attributes,
} from "../models/mongo/productModel.js";
import { Request, Response, RequestHandler } from "express";
import { CategoryItem } from "../models/mongo/categoryModel.js";

export interface CreateProduct {
    name: string;
    category: string;
    subCategory?: string;
    prefix: string;
    description: string;
    attributes: Attributes;
    price: number;
    stock?: number;
    images?: Array<{
        fileContent: Buffer;
        fileName: string;
        mimeType: string;
    }>;
    tags?: Array<string>;
}

interface MulterFile {
    buffer: Buffer;
    originalname: string;
    mimetype: string;
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
    body: {
        name: string;
        category: string;
        subCategory?: string;
        prefix: string;
        description: string;
        attributes: string;
        price: number;
        stock?: number;
        tags?: Array<string>;
    };
    files?:
        | Express.Multer.File[]
        | { [fieldname: string]: Express.Multer.File[] };
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
        sort: string;
        itemsPerPage: string;
    };
}

interface AdminProductGetRequest extends Request {
    query: {
        category?: string;
        subCategory?: string;
        tags?: string;
        page: string;
        sort: string;
        itemsPerPage: string;
        search?: string;
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
        console.log("req.query", req.query);
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

export const getAdminProducts = async (
    req: AdminProductGetRequest,
    res: Response
) => {
    try {
        const results = await productService.getAdminProducts(req.query);

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
        //Extract files and product data
        const {
            name,
            category,
            subCategory,
            prefix,
            description,
            attributes,
            price,
            stock,
            tags,
        } = req.body;

        let images: Array<{
            fileContent: Buffer;
            fileName: string;
            mimeType: string;
        }> = [];
        if (req.files) {
            if (Array.isArray(req.files)) {
                images = req.files.map((file: Express.Multer.File) => ({
                    fileContent: file.buffer,
                    fileName: file.originalname,
                    mimeType: file.mimetype,
                }));
            } else {
                for (const key in req.files) {
                    images = images.concat(
                        req.files[key].map((file: Express.Multer.File) => ({
                            fileContent: file.buffer,
                            fileName: file.originalname,
                            mimeType: file.mimetype,
                        }))
                    );
                }
            }
        }
        const attributesObj =
            typeof attributes === "string"
                ? JSON.parse(attributes)
                : attributes;
        console.log(attributesObj);
        const productData = {
            name,
            category,
            subCategory,
            prefix,
            description,
            attributes: attributesObj,
            price,
            stock,
            images,
            tags,
        };

        const result = await productService.createProduct(productData);

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
