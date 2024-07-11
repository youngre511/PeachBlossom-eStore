import Product from "../models/mongo/productModel.js";
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

export interface UpdateProduct
    extends Partial<Omit<CreateProduct, "prefix" | "stock">> {
    existingImageUrls: string[];
    productNo: string;
}

interface UpdateProductStatusRequest extends Request {
    body: {
        productNos: string[];
        newStatus: "active" | "discontinued";
    };
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
    images?:
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
        view: string;
        search?: string;
    };
}

interface PromoParamsRequest extends Request {
    params: {
        promoNum: string;
    };
}

interface UpdateProductDetailsRequest extends Request {
    body: {
        name?: string;
        productNo: string;
        category?: string;
        subCategory?: string;
        description?: string;
        attributes?: string;
        price?: number;
        existingImageUrls: string;
        tags?: Array<string>;
    };
    images?:
        | Express.Multer.File[]
        | { [fieldname: string]: Express.Multer.File[] };
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
    console.log("request", req);
    console.log("req.body", req.body);
    try {
        const {
            name,
            productNo,
            category,
            subCategory,
            description,
            attributes,
            price,
            existingImageUrls,
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

        const existingImageUrlsArray = existingImageUrls.split(", ");

        const attributesObj =
            typeof attributes === "string"
                ? JSON.parse(attributes)
                : attributes;

        const updatedProductData = {
            name,
            productNo,
            category,
            subCategory,
            description,
            attributes: attributesObj,
            price,
            images,
            existingImageUrls: existingImageUrlsArray,
            tags,
        };

        const result = await productService.updateProductDetails(
            updatedProductData
        );

        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "update product details failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

export const updateProductStatus = async (
    req: UpdateProductStatusRequest,
    res: Response
) => {
    try {
        const { productNos, newStatus } = req.body;
        const result = await productService.updateProductStatus(
            productNos,
            newStatus
        );

        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "update product status(es) failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};
