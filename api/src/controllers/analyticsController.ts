import * as analyticsService from "../services/analyticsService.js";
import { Request, Response } from "express";

interface OverTimeRequest extends Request {
    body: {
        granularity: "week" | "month" | "quarter";
        byState?: boolean;
        byRegion?: boolean;
        startDate?: string;
        endDate?: string;
    };
}

interface OverTimeExtendedRequest extends Request {
    body: {
        granularity: "week" | "month" | "quarter" | "year" | "all";
        byState?: boolean;
        byRegion?: boolean;
        startDate?: string;
        endDate?: string;
    };
}

interface ByCategoryRequest extends Request {
    body: {
        granularity: "week" | "month" | "quarter" | "year" | "all";
        byState?: boolean;
        byRegion?: boolean;
        bySubcategory?: boolean;
        startDate?: string;
        endDate?: string;
        returnPercentage?: boolean;
    };
}

export const getRevenueOverTime = async (
    req: OverTimeRequest,
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

export const getRevenueByCategory = async (
    req: ByCategoryRequest,
    res: Response
) => {
    try {
        const {
            granularity,
            startDate = null,
            endDate = null,
            byState = false,
            byRegion = false,
            bySubcategory = false,
            returnPercentage = false,
        } = req.body;
        const result = await analyticsService.getRevenueByCategory(
            granularity,
            startDate,
            endDate,
            byState,
            byRegion,
            bySubcategory,
            returnPercentage
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

export const getTransactionsOverTime = async (
    req: OverTimeExtendedRequest,
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
        const result = await analyticsService.getTransactionsOverTime(
            granularity,
            startDate,
            endDate,
            byState,
            byRegion
        );

        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "get Transactions Over Time failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const getItemsPerTransaction = async (
    req: OverTimeExtendedRequest,
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
            message: "get Items Per Transaction failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const getAverageOrderValue = async (
    req: OverTimeRequest,
    res: Response
) => {
    try {
        const {
            granularity = "month",
            startDate = null,
            endDate = null,
            byState = false,
            byRegion = false,
        } = req.body;
        const result = await analyticsService.getAverageOrderValue(
            granularity,
            startDate,
            endDate,
            byState,
            byRegion
        );

        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "get Items Per Transaction failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const getRegionRevenuePercentages = async (
    req: OverTimeRequest,
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
        const result = await analyticsService.getRegionRevenuePercentages(
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
