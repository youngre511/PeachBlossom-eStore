export type LineData = {
    id: string;
    data: Array<{ x: string; y: number }>;
};

export type BarData = { id: string } & { [key: string]: number };

export type PieData = Array<
    | string
    | {
          id: string;
          value: number;
      }
>;

export type RevenueByCategoryResponse = {
    results: LineData[] | BarData[];
    stateAbbr?: string;
    region?: string;
};

export type CategoryPercentagesResponse = {
    results: PieData[];
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

type BaseGranularity = "week" | "month" | "quarter";

export interface PlusParams extends BaseParams {
    granularity: BaseGranularity | "year";
}

export interface RRPParams extends BaseParams {
    chartType: "pie";
}

export interface TOTParams extends BaseParams {
    chartType: "line" | "bar";
    granularity: BaseGranularity | "year" | "all";
}

export interface RBCParams extends Omit<BaseParams, "byState" | "byRegion"> {
    granularity: BaseGranularity | "year" | "all";
    stateAbbr?: string;
    region?: string;
    bySubcategory?: boolean;
    returnPercentage?: boolean;
}

export interface AnalyticsState {
    revenueByCategory: {
        rbcData: LineData[] | BarData[];
        rbcParams: RBCParams | null;
        stateOrRegion: string | null;
        loading: boolean;
        error: string | null;
    };
    revenueOverTime: {
        rotData: LineData[] | BarData[];
        rotParams: PlusParams | null;
        loading: boolean;
        error: string | null;
    };
    revenueByLocation: {
        rotData: LineData[] | BarData[];
        rotParams: PlusParams | null;
        loading: boolean;
        error: string | null;
    };
    categoryPercentages: {
        rbcData: PieData[];
        rbcParams: RBCParams | null;
        stateOrRegion: string | null;
        loading: boolean;
        error: string | null;
    };
    transactionsOverTime: {
        totData: LineData[] | BarData[];
        totParams: TOTParams | null;
        loading: boolean;
        error: string | null;
    };
    itemsPerTransaction: {
        iptData: LineData[] | BarData[];
        iptParams: PlusParams | null;
        loading: boolean;
        error: string | null;
    };
    averageOrderValue: {
        aovData: LineData[] | BarData[];
        aovParams: BaseParams | null;
        loading: boolean;
        error: string | null;
    };
    regionPercentages: {
        rpData: PieData[];
        rpParams: RRPParams | null;
        loading: boolean;
        error: string | null;
    };
    salesSummary: {
        ytdRevenue: string;
        ytdTransactions: number;
        loading: boolean;
        error: string | null;
    };
}
