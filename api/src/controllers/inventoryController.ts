import * as inventoryService from "../services/inventoryService.js";
import { Request, Response } from "express";

interface CartIdRequest extends Request {
    body: {
        cartId: number;
    };
}

export const holdStock = async (req: CartIdRequest, res: Response) => {
    try {
        const { cartId } = req.body;
        const result = await inventoryService.holdStock(cartId);

        res.json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "hold stock failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

export const releaseStock = async (req: CartIdRequest, res: Response) => {
    try {
        const { cartId } = req.body;
        const result = await inventoryService.releaseStock(cartId);

        res.json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "hold stock failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};
