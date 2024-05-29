const Product = require("../models/productModel");
const generateProductNo = require("../utils/generateProductNo");
const Category = require("../models/categoryModel");
const productService = require("../services/productService");
const promotionService = require("../services/promotionService");

////////////////////////
//Types and Interfaces//
////////////////////////

import { ProductItem, Promotion } from "../models/productModel";
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

export type CreatePromo = {
    name: string;
    description: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    startDate: string;
    endDate: string;
    active: boolean;
};

type UpdatePromo = Partial<CreatePromo>;
interface AddPromoRequest extends Request {
    params: {
        target: string;
    };
    body: {
        promotion: string | CreatePromo;
    };
}

interface UpdatePromoRequest extends Request {
    params: {
        promoId: string;
    };
    body: {
        updatedData: UpdatePromo;
    };
}

interface RemovePromoRequest extends Request {
    params: {
        target: string;
    };
    body: {
        promoId: string;
    };
}

interface ProductParamsRequest extends Request {
    params: {
        productNo: string;
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

exports.getAllProducts = async (req: Request, res: Response) => {
    try {
        const results = await productService.getAllProducts();

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

exports.getProductsByCategory = async (
    req: CategoryParamsRequest,
    res: Response
) => {
    try {
        const { categoryName } = req.params;
        const results = await productService.getProductsByCategory(
            categoryName
        );

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
            promotions: [],
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

exports.updatePromotion = async (req: UpdatePromoRequest, res: Response) => {
    try {
        const updateData = req.body;
        const { promoId } = req.params;

        const result = await promotionService.updatePromo(promoId, updateData);

        res.status(200).json(result);
    } catch (error) {
        let errorObj = {
            message: "update product promotions failure",
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

// Promo Creations

exports.addPromoByCategory = async (req: AddPromoRequest, res: Response) => {
    const promotion = req.body;
    const { target } = req.params;
    try {
        const result = await productService.addPromoByCategory(
            target,
            promotion
        );

        res.status(200).json(result);
    } catch (error) {
        let errorObj = {
            message: "update promo by category failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

exports.addProductPromo = async (req: AddPromoRequest, res: Response) => {
    const promotion = req.body;
    const { target } = req.params;
    try {
        const result = await productService.addProductPromo(target, promotion);

        res.status(200).json(result);
    } catch (error) {
        let errorObj = {
            message: "update product promo failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

// Promo removal

exports.removePromoFromCategory = async (
    req: RemovePromoRequest,
    res: Response
) => {
    const { promoId } = req.body;
    const { target } = req.params;
    try {
        const result = await productService.removePromoFromCategory(
            target,
            promoId
        );

        res.status(200).json(result);
    } catch (error) {
        let errorObj = {
            message: "update promo by category failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

exports.removePromoFromProduct = async (
    req: RemovePromoRequest,
    res: Response
) => {
    const { promoId } = req.body;
    const { target } = req.params;
    try {
        const result = await productService.removePromoFromProduct(
            target,
            promoId
        );

        res.status(200).json(result);
    } catch (error) {
        let errorObj = {
            message: "update product promo failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};
