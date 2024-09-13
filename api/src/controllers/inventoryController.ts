import * as inventoryService from "../services/inventoryService.js";
import { Request, Response } from "express";
import { AdminFilterObj } from "../services/serviceTypes.js";

interface CartIdRequest extends Request {
    body: {
        cartId: number;
    };
}

interface StockUpdateRequest extends Request {
    body: {
        updateData: Record<string, number>;
        filters: AdminFilterObj;
    };
}

export const holdStock = async (req: CartIdRequest, res: Response) => {
    try {
        const { cartId } = req.body;
        const expirationTime = await inventoryService.holdStock(cartId);

        res.json({
            message: "success",
            payload: expirationTime,
        });
    } catch (error) {
        let errorObj = {
            message: "hold stock failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
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
            message: "release stock failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const updateStockLevels = async (
    req: StockUpdateRequest,
    res: Response
) => {
    try {
        const { updateData, filters } = req.body;
        const result = await inventoryService.updateStockLevels(
            updateData,
            filters
        );

        res.json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "update stock levels failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const syncStockLevels = async (req: Request, res: Response) => {
    try {
        const result = await inventoryService.syncStockLevels();

        res.json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "sync stock failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};
