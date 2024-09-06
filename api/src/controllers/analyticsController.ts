import * as analyticsService from "../services/analyticsService.js";
import { Request, Response } from "express";

interface ROTRequest extends Request {
    body: {
        granularity: "week" | "month" | "quarter";
        byState?: boolean;
        byRegion?: boolean;
        startDate?: string;
        endDate?: string;
    };
}

interface RBCRequest extends Request {
    body: {
        granularity: "week" | "month" | "quarter" | "year" | "all";
        byState?: boolean;
        byRegion?: boolean;
        bySubcategory?: boolean;
        startDate?: string;
        endDate?: string;
    };
}

export const getRevenueOverTime = async (req: ROTRequest, res: Response) => {
    try {
        const {
            granularity,
            startDate = null,
            endDate = null,
            byState = false,
            byRegion = false,
        } = req.body;
        const result = await analyticsService.getRevenueOverTime(
            granularity,
            startDate,
            endDate,
            byState,
            byRegion
        );

        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "get Revenue Over Time failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const getRevenueByCategory = async (req: RBCRequest, res: Response) => {
    try {
        const {
            granularity,
            startDate = null,
            endDate = null,
            byState = false,
            byRegion = false,
            bySubcategory = false,
        } = req.body;
        const result = await analyticsService.getRevenueByCategory(
            granularity,
            startDate,
            endDate,
            byState,
            byRegion,
            bySubcategory
        );

        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "get Revenue By Category failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const getTransactionStats = async (req: ROTRequest, res: Response) => {
    try {
        const {
            granularity,
            startDate = null,
            endDate = null,
            byState = false,
            byRegion = false,
        } = req.body;
        const result = await analyticsService.getTransactionStats(
            granularity,
            startDate,
            endDate,
            byState,
            byRegion
        );

        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "get Revenue Over Time failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const getItemsPerTransaction = async (
    req: ROTRequest,
    res: Response
) => {
    try {
        const {
            granularity,
            startDate = null,
            endDate = null,
            byState = false,
            byRegion = false,
        } = req.body;
        const result = await analyticsService.getItemsPerTransaction(
            granularity,
            startDate,
            endDate,
            byState,
            byRegion
        );

        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "get Revenue Over Time failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};
