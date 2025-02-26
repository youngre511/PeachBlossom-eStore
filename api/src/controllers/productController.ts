import * as productService from "../services/productService.js";
import * as promotionService from "../services/promotionService.js";
import { Request, Response, RequestHandler } from "express";
import {
    AdminProductGetRequest,
    CreateProductRequest,
    ProductGetRequest,
    ProductParamsRequest,
    PromoParamsRequest,
    SearchOptions,
    UpdateProductDetailsRequest,
    UpdateProductStatusRequest,
} from "./_controllerTypes.js";

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

        console.error(errorObj);

        res.status(500).json(errorObj);
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

        console.error(errorObj);

        res.status(500).json(errorObj);
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

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const getCatalogProductDetails = async (
    req: ProductParamsRequest,
    res: Response
) => {
    try {
        const { productNo } = req.params;
        let username = null;
        if (req.user) {
            username = req.user.username;
        }

        const result = await productService.getCatalogProductDetails(
            productNo,
            username
        );

        res.json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "get catalog product details failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
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

        console.error(errorObj);

        res.status(500).json(errorObj);
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

        console.error(errorObj);

        res.status(500).json(errorObj);
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
            subcategory,
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
            subcategory,
            prefix,
            description,
            attributes: attributesObj,
            price,
            stock,
            tags,
        };

        const result = await productService.createProduct(productData, images);

        res.status(200).json(result);
    } catch (error) {
        let errorObj = {
            message: "create product failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
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
        const response = await productService.deleteProduct(
            req.params.productNo
        );

        res.json(response);
    } catch (error) {
        let errorObj = {
            message: "delete product failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
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
        const {
            name,
            productNo,
            category,
            subcategory,
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
            subcategory,
            description,
            attributes: attributesObj,
            price,
            existingImageUrls: existingImageUrlsArray,
            tags,
        };

        const result = await productService.updateProductDetails(
            updatedProductData,
            images
        );

        res.status(200).json(result);
    } catch (error) {
        let errorObj = {
            message: "update product details failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
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

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};
