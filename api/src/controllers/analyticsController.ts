import * as analyticsService from "../services/analyticsService.js";
import { Request, Response } from "express";

type BaseGranularity = "week" | "month" | "quarter";
const baseGranularityArr = ["week", "month", "quarter"];

type GranularityPlus = "week" | "month" | "quarter" | "year";
const granularityPlusArr = ["week", "month", "quarter", "year"];

type GranularityExtended = "week" | "month" | "quarter" | "year" | "all";
const granularityExtendedArr = ["week", "month", "quarter", "year", "all"];

export type ChartType = "bar" | "line" | "pie";
const chartTypeArr = ["bar", "line", "pie"];

interface OverTimeRequest extends Request {
    query: {
        granularity: string;
        byState?: string;
        byRegion?: string;
        startDate?: string;
        endDate?: string;
        chartType: string;
    };
}
interface OverTimeParams {
    granularity: BaseGranularity;
    byState: boolean;
    byRegion: boolean;
    startDate: string;
    endDate: string;
    chartType: ChartType;
}

interface OverTimePlusParams {
    granularity: GranularityPlus;
    byState: boolean;
    byRegion: boolean;
    startDate: string;
    endDate: string;
    chartType: ChartType;
}

interface OverTimeExtendedParams {
    granularity: GranularityExtended;
    byState: boolean;
    byRegion: boolean;
    startDate: string;
    endDate: string;
    chartType: ChartType;
}

interface ByCategoryRequest extends Request {
    query: {
        granularity: string;
        byState?: string;
        byRegion?: string;
        bySubcategory?: string;
        startDate?: string;
        endDate?: string;
        returnPercentage?: string;
        chartType: string;
    };
}

interface ByCategoryParams {
    granularity: GranularityExtended;
    byState: boolean;
    byRegion: boolean;
    bySubcategory: boolean;
    startDate: string;
    endDate: string;
    returnPercentage: boolean;
    chartType: ChartType;
}

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
            byState = false,
            byRegion = false,
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
            byState,
            byRegion,
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
        } = convertParams<OverTimeExtendedParams, GranularityExtended>(
            granularityExtendedArr,
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
        const data = req.query;
        const {
            granularity,
            startDate = null,
            endDate = null,
            byState = false,
            byRegion = false,
            chartType,
        } = convertParams<OverTimeParams, BaseGranularity>(
            baseGranularityArr,
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
            message: "get Revenue Over Time failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};
