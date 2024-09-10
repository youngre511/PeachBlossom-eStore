export interface LineData {
    id: string;
    data: Array<{ x: string; y: number }>;
}

export interface BaseParams {
    startDate?: string;
    endDate?: string;
    byState?: boolean;
    byRegion?: boolean;
    chartType: "line" | "bar" | "pie";
}

type BaseGranularity = "week" | "month" | "quarter";

export interface ROTParams extends BaseParams {
    granularity: BaseGranularity | "year";
}

export interface AnalyticsState {
    revenueByCategory: {};
    revenueOverTime: {
        rotData: LineData[];
        rotParams: ROTParams | null;
    };
    categoryPercentages: {};
    transactionsOverTime: {};
    itemsPerTransaction: {};
    averageOrderValue: {};
    regionPercentages: {};
    salesSummary: {
        ytdRevenue: string;
    };
    loading: boolean;
    error: string | null;
}
