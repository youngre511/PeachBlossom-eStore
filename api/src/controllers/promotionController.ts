const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const promotionService = require("../services/promotionService");

// Types and interfaces
import { ProductItem, Promotion } from "../models/mongo/productModel";
import { Request, Response } from "express";

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

interface PromoParamsRequest extends Request {
    params: {
        promoNum: string;
    };
}

interface CreatePromoRequest extends Request {
    body: {
        promotion: CreatePromo;
        categories?: string[];
        products?: string[];
    };
}

interface AddToPromoRequest extends Request {
    params: {
        promoId: string;
    };
    body: {
        categories?: string[];
        products?: string[];
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
        promoId: string;
    };
    body: {
        categories?: string[];
        products?: string[];
    };
}

// Controllers

exports.getAllPromotions = async (req: Request, res: Response) => {
    //Fetch promos from SQL
};

exports.getOnePromotion = async (req: PromoParamsRequest, res: Response) => {
    // Fetch one promo from SQL
};

exports.createPromotion = async (req: CreatePromoRequest, res: Response) => {
    try {
        const args: {
            promotion: CreatePromo;
            products?: string[];
            categories?: string[];
        } = { promotion: req.body.promotion };
        if (req.body.products) {
            args["products"] = req.body.products;
        }
        if (req.body.categories) {
            args["categories"] = req.body.categories;
        }

        const result = await promotionService.createPromotion(args);

        res.status(200).json(result);
    } catch (error) {
        let errorObj = {
            message: "delete promotions failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

exports.addToPromotion = async (req: AddToPromoRequest, res: Response) => {
    const { promoId } = req.params;
    try {
        let result: Array<{ success: boolean; message: string }> = [];
        if (Object.keys(req.body).length === 0) {
            throw new Error("Must specify categories or products");
        }

        if (req.body.categories) {
            const catResult: { success: boolean; message: string } =
                await promotionService.addCategoryToPromo(
                    promoId,
                    req.body.categories
                );
            result.push(catResult);
        }
        if (req.body.products) {
            const prodResult: { success: boolean; message: string } =
                await promotionService.addProductToPromo(
                    promoId,
                    req.body.products
                );
            result.push(prodResult);
        }

        res.status(200).json(result);
    } catch (error) {
        let errorObj = {
            message: "add to promo failure",
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

exports.removeFromPromotion = async (
    req: RemovePromoRequest,
    res: Response
) => {
    const { promoId } = req.params;
    try {
        let result: Array<{ success: boolean; message: string }> = [];
        if (Object.keys(req.body).length === 0) {
            throw new Error("Must specify categories or products");
        }

        if (req.body.categories) {
            const catResult: { success: boolean; message: string } =
                await promotionService.removeCategoryFromPromo(
                    promoId,
                    req.body.categories
                );
            result.push(catResult);
        }
        if (req.body.products) {
            const prodResult: { success: boolean; message: string } =
                await promotionService.removeProductFromPromo(
                    promoId,
                    req.body.products
                );
            result.push(prodResult);
        }

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

exports.deletePromotion = async (req: RemovePromoRequest, res: Response) => {
    try {
        const args: {
            promotion: string;
            products?: string[];
            categories?: string[];
        } = { promotion: req.params.promoId };
        if (req.body.products) {
            args["products"] = req.body.products;
        }
        if (req.body.categories) {
            args["categories"] = req.body.categories;
        }

        const result = await promotionService.deletePromotion(args);

        res.status(200).json(result);
    } catch (error) {
        let errorObj = {
            message: "delete promotions failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};
