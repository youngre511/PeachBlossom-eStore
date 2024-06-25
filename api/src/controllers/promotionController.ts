import Product from "../models/mongo/productModel";
import Category from "../models/mongo/categoryModel";
import * as promotionService from "../services/promotionService";

// Types and interfaces
import { ProductItem, Promotion } from "../models/mongo/productModel";
import { Request, Response, RequestHandler } from "express";

export type CreatePromo = {
    name: string;
    description: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    startDate: string;
    endDate: string;
    active: boolean;
};

type UpdatePromo = Partial<Promotion>;

interface PromoParamsRequestParams {
    promoNum: string;
}

interface CreatePromoRequest extends Request {
    body: {
        promotion: CreatePromo;
        categories?: string[];
        products?: string[];
    };
}

interface AddToPromoRequestParams {
    promoId: string;
}

interface CategoriesAndProductsBody {
    categories?: string[];
    products?: string[];
}

interface AddToPromoRequest
    extends Request<AddToPromoRequestParams, any, CategoriesAndProductsBody> {}

interface UpdatePromoRequestParams {
    promoId: string;
}

interface UpdatePromoRequestBody {
    updatedData: UpdatePromo;
}

interface UpdatePromoRequest
    extends Request<UpdatePromoRequestParams, any, UpdatePromoRequestBody> {}

interface RemovePromoRequestParams {
    promoId: string;
}

interface RemovePromoRequest
    extends Request<RemovePromoRequestParams, any, CategoriesAndProductsBody> {}

// Controllers

export const getAllPromotions: RequestHandler = async (
    req: Request,
    res: Response
) => {
    //Fetch promos from SQL
};

export const getOnePromotion: RequestHandler<PromoParamsRequestParams> = async (
    req: Request<PromoParamsRequestParams>,
    res: Response
) => {
    // Fetch one promo from SQL
};

export const createPromotion: RequestHandler = async (
    req: CreatePromoRequest,
    res: Response
) => {
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

export const addToPromotion: RequestHandler<
    AddToPromoRequestParams,
    any,
    CategoriesAndProductsBody
> = async (req: AddToPromoRequest, res: Response) => {
    const { promoId } = req.params;
    try {
        let result: Array<{ success: boolean; message: string }> = [];
        if (Object.keys(req.body).length === 0) {
            throw new Error("Must specify categories or products");
        }

        if (req.body.categories) {
            const catResult: { success: boolean; message: string } =
                await promotionService.addCategoriesToPromo(
                    promoId,
                    req.body.categories
                );
            result.push(catResult);
        }
        if (req.body.products) {
            const prodResult: { success: boolean; message: string } =
                await promotionService.addProductsToPromo(
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

export const updatePromotion: RequestHandler<
    UpdatePromoRequestParams,
    any,
    UpdatePromoRequestBody
> = async (req: UpdatePromoRequest, res: Response) => {
    try {
        const { updatedData } = req.body;
        const { promoId } = req.params;

        const result = await promotionService.updatePromo(promoId, updatedData);

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

export const removeFromPromotion: RequestHandler<
    RemovePromoRequestParams,
    any,
    CategoriesAndProductsBody
> = async (req: RemovePromoRequest, res: Response) => {
    const { promoId } = req.params;
    try {
        let result: Array<{ success: boolean; message: string }> = [];
        if (Object.keys(req.body).length === 0) {
            throw new Error("Must specify categories or products");
        }

        if (req.body.categories) {
            const catResult: { success: boolean; message: string } =
                await promotionService.removeCategoriesFromPromo(
                    promoId,
                    req.body.categories
                );
            result.push(catResult);
        }
        if (req.body.products) {
            const prodResult: { success: boolean; message: string } =
                await promotionService.removeProductsFromPromo(
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

// export const deletePromotion: RequestHandler = async (
//     req: RemovePromoRequest,
//     res: Response
// ) => {
//     try {
//         const args: {
//             promotion: string;
//             products?: string[];
//             categories?: string[];
//         } = { promotion: req.params.promoId };
//         if (req.body.products) {
//             args["products"] = req.body.products;
//         }
//         if (req.body.categories) {
//             args["categories"] = req.body.categories;
//         }

//         const result = await promotionService.deletePromotion(args);

//         res.status(200).json(result);
//     } catch (error) {
//         let errorObj = {
//             message: "delete promotions failure",
//             payload: error,
//         };

//         console.log(errorObj);

//         res.json(errorObj);
//     }
// };
