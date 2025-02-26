import * as analyticsService from "../services/analyticsService.js";
import { Request, Response } from "express";
import {
    BaseGranularity,
    baseGranularityArr,
    ByCategoryParams,
    ByCategoryRequest,
    ChartType,
    chartTypeArr,
    GranularityExtended,
    granularityExtendedArr,
    GranularityPlus,
    granularityPlusArr,
    OverTimeExtendedParams,
    OverTimeParams,
    OverTimePlusParams,
    OverTimeRequest,
    TopProductsRequest,
} from "./_controllerTypes.js";

const convertParams = <
    T extends
        | ByCategoryParams
        | OverTimeParams
        | OverTimeExtendedParams
        | OverTimePlusParams,
    G extends BaseGranularity | GranularityPlus | GranularityExtended
>(
    validGranularityValues: string[],
    data: Record<string, string>
): T => {
    const result = {} as T;
    Object.keys(data).forEach((key) => {
        let value = data[key];

        if (
            [
                "byState",
                "byRegion",
                "bySubcategory",
                "returnPercentage",
            ].includes(key)
        ) {
            (result as any)[key as keyof T] = value === "true";
        } else if (
            key === "granularity" &&
            validGranularityValues.includes(value)
        ) {
            (result as any)[key as keyof T] = value as G;
        } else if (key === "chartType" && chartTypeArr.includes(value)) {
            (result as any)[key as keyof T] = value as ChartType;
        } else {
            (result as any)[key as keyof T] = value;
        }
    });
    return result;
};

// Controller Functions

export const getRevenueOverTime = async (
    req: OverTimeRequest,
    res: Response
) => {
    try {
        const data = req.query;
        const {
            granularity,
            startDate = null,
            endDate = null,
            byState = false,
            byRegion = false,
            chartType,
        } = convertParams<OverTimePlusParams, GranularityPlus>(
            granularityPlusArr,
            data
        );
        const result = await analyticsService.getRevenueOverTime(
            granularity,
            startDate,
            endDate,
            byState,
            byRegion,
            chartType
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
        const data = req.query;
        const {
            granularity,
            startDate = null,
            endDate = null,
            stateAbbr = null,
            region = null,
            bySubcategory = false,
            returnPercentage = false,
            chartType,
        } = convertParams<ByCategoryParams, GranularityExtended>(
            granularityExtendedArr,
            data
        );
        const result = await analyticsService.getRevenueByCategory(
            granularity,
            startDate,
            endDate,
            stateAbbr,
            region,
            bySubcategory,
            returnPercentage,
            chartType
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
    req: OverTimeRequest,
    res: Response
) => {
    try {
        const data = req.query;
        const {
            granularity,
            startDate = null,
            endDate = null,
            byState = false,
            byRegion = false,
            chartType,
        } = convertParams<OverTimeExtendedParams, GranularityExtended>(
            granularityExtendedArr,
            data
        );
        const result = await analyticsService.getTransactionsOverTime(
            granularity,
            startDate,
            endDate,
            byState,
            byRegion,
            chartType
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
    req: OverTimeRequest,
    res: Response
) => {
    try {
        const data = req.query;
        const {
            granularity,
            startDate = null,
            endDate = null,
            byState = false,
            byRegion = false,
            chartType,
        } = convertParams<OverTimePlusParams, GranularityPlus>(
            granularityPlusArr,
            data
        );
        const result = await analyticsService.getItemsPerTransaction(
            granularity,
            startDate,
            endDate,
            byState,
            byRegion,
            chartType
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
        const data = req.query;
        const {
            granularity = "month",
            startDate = null,
            endDate = null,
            byState = false,
            byRegion = false,
            chartType,
        } = convertParams<OverTimeParams, BaseGranularity>(
            baseGranularityArr,
            data
        );
        const result = await analyticsService.getAverageOrderValue(
            granularity,
            startDate,
            endDate,
            byState,
            byRegion,
            chartType
        );

        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "get average order value failure",
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
        const data = req.query;
        const {
            granularity,
            startDate = null,
            endDate = null,
            byState = false,
            byRegion = false,
            chartType,
        } = convertParams<OverTimePlusParams, GranularityExtended>(
            granularityPlusArr,
            data
        );
        const result = await analyticsService.getRegionRevenuePercentages(
            granularity,
            startDate,
            endDate,
            byState,
            byRegion,
            chartType
        );

        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "get Regional Revenue Percentages failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const getTopProducts = async (
    req: TopProductsRequest,
    res: Response
) => {
    try {
        const { period, worstPerforming, number } = req.query;
        const worst = worstPerforming === "true";
        const result = await analyticsService.getTopProducts(
            period as "7d" | "30d" | "6m" | "1y" | "allTime",
            worst,
            Number(number)
        );

        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "get Top Five Products failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};
