export type LineData = {
    id: string;
    data: Array<{ x: string; y: number }>;
};

export type BarData = { id: string } & { [key: string]: number };

export type PieData = Array<{
    id: string;
    value: number;
}>;

export type PieDataArray = Array<{
    period: string;
    data: PieData;
}>;

export type RevenueByCategoryResponse = {
    results: LineData[] | BarData[];
    stateAbbr?: string;
    region?: string;
};

export type CategoryPercentagesResponse = {
    results: PieDataArray;
    stateAbbr?: string;
    region?: string;
};

export interface BaseParams {
    startDate?: string;
    endDate?: string;
    byState?: boolean;
    byRegion?: boolean;
    chartType: "line" | "bar" | "pie";
}

export type BaseGranularity = "week" | "month" | "quarter";

export type PlusGranularity = BaseGranularity | "year";

export type ExpandedGranularity = PlusGranularity | "all";

export interface PlusParams extends BaseParams {
    granularity: PlusGranularity;
}

export interface RRPParams extends BaseParams {
    chartType: "pie";
    granularity: PlusGranularity;
}

export interface TOTParams extends BaseParams {
    chartType: "line" | "bar";
    granularity: ExpandedGranularity;
}

export interface RBCParams extends Omit<BaseParams, "byState" | "byRegion"> {
    granularity: ExpandedGranularity;
    stateAbbr?: string;
    region?: string;
    bySubcategory?: boolean;
    returnPercentage?: boolean;
}

export interface AOVParams extends BaseParams {
    granularity: BaseGranularity;
}

export interface TopProduct {
    thumbnailUrl: string | null;
    name: string;
    productNo: string;
    price: number;
    category: string;
    subcategory: string | null;
    description: string;
    totalQuantity: number;
}

export type Period = "7d" | "30d" | "6m" | "1y" | "allTime";
export interface TopParams {
    period: Period;
}

export interface AnalyticsState {
    revenueByCategory: {
        rbcData: LineData[] | BarData[];
        rbcParams: RBCParams | null;
        stateOrRegion: string | null;
        expiration: number | null;
        loading: boolean;
        error: string | null;
    };
    revenueOverTime: {
        rotData: LineData[] | BarData[];
        rotParams: PlusParams | null;
        expiration: number | null;
        loading: boolean;
        error: string | null;
    };
    revenueByLocation: {
        rotData: LineData[] | BarData[];
        rotParams: PlusParams | null;
        expiration: number | null;
        loading: boolean;
        error: string | null;
    };
    categoryPercentages: {
        rbcData: PieDataArray;
        rbcParams: RBCParams | null;
        stateOrRegion: string | null;
        expiration: number | null;
        loading: boolean;
        error: string | null;
    };
    transactionsOverTime: {
        totData: LineData[] | BarData[];
        totParams: TOTParams | null;
        expiration: number | null;
        loading: boolean;
        error: string | null;
    };
    itemsPerTransaction: {
        iptData: LineData[] | BarData[];
        iptParams: PlusParams | null;
        expiration: number | null;
        loading: boolean;
        error: string | null;
    };
    averageOrderValue: {
        aovData: LineData[] | BarData[];
        aovParams: AOVParams | null;
        expiration: number | null;
        loading: boolean;
        error: string | null;
    };
    regionPercentages: {
        rpData: PieDataArray;
        rpParams: RRPParams | null;
        expiration: number | null;
        loading: boolean;
        error: string | null;
    };
    salesSummary: {
        ytdRevenue: string;
        ytdTransactions: number;
        mtdRevenue: string;
        mtdTransactions: number;
        expiration: number | null;
        loading: boolean;
        error: string | null;
    };
    topFiveProducts: {
        period: "7d" | "30d" | "6m" | "1y" | "allTime";
        products: TopProduct[];
        expiration: number | null;
        loading: boolean;
        error: string | null;
    };
    topTenProducts: {
        period: "7d" | "30d" | "6m" | "1y" | "allTime";
        products: TopProduct[];
        expiration: number | null;
        loading: boolean;
        error: string | null;
    };
    topTenWorstProducts: {
        period: "7d" | "30d" | "6m" | "1y" | "allTime";
        products: TopProduct[];
        expiration: number | null;
        loading: boolean;
        error: string | null;
    };
}
