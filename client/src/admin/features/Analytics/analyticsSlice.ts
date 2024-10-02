import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
import axios from "axios";
import {
    AnalyticsState,
    BarData,
    CategoryPercentagesResponse,
    LineData,
    RBCParams,
    RevenueByCategoryResponse,
    PlusParams,
    RRPParams,
    TOTParams,
    AOVParams,
    TopProduct,
    PieDataArray,
} from "./analyticsTypes";
import { arraysEqual } from "../../../common/utils/arraysEqual";
import { useNavigate } from "react-router-dom";
import {
    fetchRBCData,
    fetchROTData,
    fetchTopProducts,
    fetchTOTData,
    generateExpirationTime,
} from "./analyticsUtils";

const initialState: AnalyticsState = {
    revenueByCategory: {
        rbcData: [],
        rbcParams: null,
        stateOrRegion: null,
        expiration: null,
        loading: false,
        error: null,
    },
    revenueOverTime: {
        rotData: [],
        rotParams: null,
        loading: false,
        expiration: null,
        error: null,
    },
    revenueByLocation: {
        rotData: [],
        rotParams: null,
        loading: false,
        expiration: null,
        error: null,
    },
    categoryPercentages: {
        rbcData: [],
        rbcParams: null,
        stateOrRegion: null,
        expiration: null,
        loading: false,
        error: null,
    },
    transactionsOverTime: {
        totData: [],
        totParams: null,
        expiration: null,
        loading: false,
        error: null,
    },
    itemsPerTransaction: {
        iptData: [],
        iptParams: null,
        expiration: null,
        loading: false,
        error: null,
    },
    averageOrderValue: {
        aovData: [],
        aovParams: null,
        expiration: null,
        loading: false,
        error: null,
    },
    regionPercentages: {
        rpData: [],
        rpParams: null,
        expiration: null,
        loading: false,
        error: null,
    },
    salesSummary: {
        ytdRevenue: "0.00",
        ytdTransactions: 0,
        mtdRevenue: "0.00",
        mtdTransactions: 0,
        expiration: null,
        loading: false,
        error: null,
    },
    topFiveProducts: {
        period: "30d",
        products: [],
        expiration: null,
        loading: false,
        error: null,
    },
    topTenProducts: {
        period: "30d",
        products: [],
        expiration: null,
        loading: false,
        error: null,
    },
    topTenWorstProducts: {
        period: "30d",
        products: [],
        expiration: null,
        loading: false,
        error: null,
    },
};

//Thunks//

export const fetchRevenueOverTime = createAsyncThunk<
    { params: PlusParams; data: LineData[] | BarData[] },
    { params: PlusParams; force?: boolean },
    { state: RootState }
>(
    "analytics/fetchRevenueOverTime",
    async ({ params, force = false }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const rotState = state.analytics.revenueOverTime;
        const rotData = await fetchROTData(
            params,
            force,
            rotState,
            rejectWithValue
        );
        return rotData;
    }
);

export const fetchYTD = createAsyncThunk<
    {
        ytdRevenue: string;
        ytdTransactions: number;
        mtdRevenue: string;
        mtdTransactions: number;
    },
    void,
    { state: RootState }
>("analytics/fetchYTD", async (_, { getState, rejectWithValue }) => {
    const state = getState() as RootState;
    const salesSummary = state.analytics.salesSummary;
    const rotState = state.analytics.revenueOverTime;
    const totState = state.analytics.transactionsOverTime;
    const today = new Date();
    const startDate = `01-01-${today.getFullYear()}`;
    const monthStartDate = `${today.getMonth() + 1}-01-${today.getFullYear()}`;
    if (
        salesSummary.ytdRevenue &&
        salesSummary.ytdTransactions &&
        salesSummary.mtdRevenue &&
        salesSummary.mtdTransactions &&
        (!salesSummary.expiration || Date.now() < salesSummary.expiration)
    ) {
        return {
            ytdRevenue: salesSummary.ytdRevenue,
            ytdTransactions: salesSummary.ytdTransactions,
            mtdRevenue: salesSummary.mtdRevenue,
            mtdTransactions: salesSummary.mtdTransactions,
        };
    }
    try {
        const rotResponseYTD = await fetchROTData(
            { granularity: "year", chartType: "pie", startDate: startDate },
            true,
            rotState,
            rejectWithValue
        );
        const totResponseYTD = await fetchTOTData(
            { granularity: "year", chartType: "line", startDate: startDate },
            true,
            totState,
            rejectWithValue
        );
        const rotResponseMTD = await fetchROTData(
            {
                granularity: "month",
                chartType: "pie",
                startDate: monthStartDate,
            },
            true,
            rotState,
            rejectWithValue
        );
        const totResponseMTD = await fetchTOTData(
            {
                granularity: "month",
                chartType: "line",
                startDate: monthStartDate,
            },
            true,
            totState,
            rejectWithValue
        );

        return {
            ytdRevenue: rotResponseYTD.data[0].data[0].value,
            ytdTransactions: totResponseYTD.data[0].data[0].y,
            mtdRevenue: rotResponseMTD.data[0].data[0].value,
            mtdTransactions: totResponseMTD.data[0].data[0].y,
        };
    } catch (error) {
        if (error && typeof error === "object" && "response" in error) {
            const axiosError = error as any; // If using Axios or a similar HTTP client
            return rejectWithValue(
                axiosError.response?.data || "Error fetching Year-To-Date data"
            );
        } else {
            return rejectWithValue("Unknown error occurred");
        }
    }
});

export const fetchRevenueByLocation = createAsyncThunk<
    { params: PlusParams; data: LineData[] | BarData[] },
    { params: PlusParams; force?: boolean },
    { state: RootState }
>(
    "analytics/fetchRevenueByLocation",
    async ({ params, force = false }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const rblState = state.analytics.revenueByLocation;
        const rblData = await fetchROTData(
            params,
            force,
            rblState,
            rejectWithValue
        );
        return rblData;
    }
);

export const fetchRegionPercentages = createAsyncThunk<
    { params: RRPParams; data: PieDataArray },
    { params: RRPParams; force?: boolean },
    { state: RootState }
>(
    "analytics/fetchRegionPercentages",
    async ({ params, force = false }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const rpState = state.analytics.regionPercentages;
        const existingParams = rpState.rpParams;
        let paramsUnchanged = true;

        const keys = Object.keys(params) as Array<keyof RRPParams>;
        if (existingParams && rpState.rpData.length > 0) {
            for (let key of keys) {
                const currentValue = params[key];
                const existingValue = existingParams[key];
                if (
                    Array.isArray(currentValue) &&
                    Array.isArray(existingValue)
                ) {
                    if (!arraysEqual(currentValue, existingValue)) {
                        paramsUnchanged = false;
                        break;
                    }
                } else if (currentValue !== existingValue) {
                    paramsUnchanged = false;
                    break;
                }
            }
        } else {
            paramsUnchanged = false;
        }

        if (
            paramsUnchanged &&
            !force &&
            (!rpState.expiration || Date.now() < rpState.expiration)
        ) {
            return {
                params,
                data: rpState.rpData,
            };
        }

        const token = localStorage.getItem("jwtToken"); // Get the token from local storage
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/analytics/rrp`,
                {
                    params: params,
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            return {
                params: params,
                data: response.data,
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Error fetching revenue over time"
            );
        }
    }
);

export const fetchAverageOrderValue = createAsyncThunk<
    { params: AOVParams; data: BarData[] | LineData[] },
    { params: AOVParams; force?: boolean },
    { state: RootState }
>(
    "analytics/fetchAverageOrderValue",
    async ({ params, force = false }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const aovState = state.analytics.averageOrderValue;
        const existingParams = aovState.aovParams;
        let paramsUnchanged = true;

        const keys = Object.keys(params) as Array<keyof RRPParams>;
        if (existingParams && aovState.aovData.length > 0) {
            for (let key of keys) {
                const currentValue = params[key];
                const existingValue = existingParams[key];
                if (
                    Array.isArray(currentValue) &&
                    Array.isArray(existingValue)
                ) {
                    if (!arraysEqual(currentValue, existingValue)) {
                        paramsUnchanged = false;
                        break;
                    }
                } else if (currentValue !== existingValue) {
                    paramsUnchanged = false;
                    break;
                }
            }
        } else {
            paramsUnchanged = false;
        }

        if (
            paramsUnchanged &&
            !force &&
            (!aovState.expiration || Date.now() < aovState.expiration)
        ) {
            return {
                params,
                data: aovState.aovData,
            };
        }

        const token = localStorage.getItem("jwtToken"); // Get the token from local storage
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/analytics/aov`,
                {
                    params: params,
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            return {
                params: params,
                data: response.data,
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Error fetching average order value"
            );
        }
    }
);

export const fetchItemsPerTransaction = createAsyncThunk<
    { params: PlusParams; data: BarData[] | LineData[] },
    { params: PlusParams; force?: boolean },
    { state: RootState }
>(
    "analytics/fetchItemsPerTransaction",
    async ({ params, force = false }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const iptState = state.analytics.itemsPerTransaction;
        const existingParams = iptState.iptParams;
        let paramsUnchanged = true;

        const keys = Object.keys(params) as Array<keyof RRPParams>;
        if (existingParams && iptState.iptData.length > 0) {
            for (let key of keys) {
                const currentValue = params[key];
                const existingValue = existingParams[key];
                if (
                    Array.isArray(currentValue) &&
                    Array.isArray(existingValue)
                ) {
                    if (!arraysEqual(currentValue, existingValue)) {
                        paramsUnchanged = false;
                        break;
                    }
                } else if (currentValue !== existingValue) {
                    paramsUnchanged = false;
                    break;
                }
            }
        } else {
            paramsUnchanged = false;
        }

        if (
            paramsUnchanged &&
            !force &&
            (!iptState.expiration || Date.now() < iptState.expiration)
        ) {
            return {
                params,
                data: iptState.iptData,
            };
        }

        const token = localStorage.getItem("jwtToken"); // Get the token from local storage
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/analytics/ipt`,
                {
                    params: params,
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            return {
                params: params,
                data: response.data,
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Error fetching items per transaction"
            );
        }
    }
);

export const fetchRevenueByCategory = createAsyncThunk<
    { params: RBCParams; data: RevenueByCategoryResponse },
    { params: RBCParams; force?: boolean },
    { state: RootState }
>(
    "analytics/fetchRevenueByCategory",
    async ({ params, force = false }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const rbcState = state.analytics.revenueByCategory;
        return await fetchRBCData<LineData[] | BarData[]>(
            params,
            force,
            rbcState,
            rejectWithValue
        );
    }
);

export const fetchCategoryPercentages = createAsyncThunk<
    { params: RBCParams; data: CategoryPercentagesResponse },
    { params: RBCParams; force?: boolean },
    { state: RootState }
>(
    "analytics/fetchCategoryPercentages",
    async ({ params, force = false }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const cpState = state.analytics.categoryPercentages;
        return await fetchRBCData<PieDataArray>(
            params,
            force,
            cpState,
            rejectWithValue
        );
    }
);

export const fetchTransactionsOverTime = createAsyncThunk<
    { params: TOTParams; data: LineData[] | BarData[] },
    { params: TOTParams; force?: boolean },
    { state: RootState }
>(
    "analytics/fetchTransactionsOverTime",
    async ({ params, force = false }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const totState = state.analytics.transactionsOverTime;
        return await fetchTOTData(params, force, totState, rejectWithValue);
    }
);

export const fetchTopFiveProducts = createAsyncThunk<
    { period: "7d" | "30d" | "6m" | "1y" | "allTime"; products: TopProduct[] },
    { period: "7d" | "30d" | "6m" | "1y" | "allTime"; force?: boolean },
    { state: RootState }
>(
    "analytics/fetchTopFiveProducts",
    async ({ period, force = false }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const topProductState = state.analytics.topFiveProducts;

        try {
            return fetchTopProducts(
                period,
                "5",
                false,
                false,
                topProductState,
                rejectWithValue
            );
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Error fetching top products"
            );
        }
    }
);

export const fetchTopTenProducts = createAsyncThunk<
    { period: "7d" | "30d" | "6m" | "1y" | "allTime"; products: TopProduct[] },
    { period: "7d" | "30d" | "6m" | "1y" | "allTime"; force?: boolean },
    { state: RootState }
>(
    "analytics/fetchTopTenProducts",
    async ({ period, force = false }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const topProductState = state.analytics.topTenProducts;

        try {
            return fetchTopProducts(
                period,
                "10",
                false,
                false,
                topProductState,
                rejectWithValue
            );
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Error fetching top products"
            );
        }
    }
);

export const fetchTopTenWorstProducts = createAsyncThunk<
    { period: "7d" | "30d" | "6m" | "1y" | "allTime"; products: TopProduct[] },
    { period: "7d" | "30d" | "6m" | "1y" | "allTime"; force?: boolean },
    { state: RootState }
>(
    "analytics/fetchTopTenWorstProducts",
    async ({ period, force = false }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const topProductState = state.analytics.topTenWorstProducts;

        try {
            return fetchTopProducts(
                period,
                "10",
                true,
                false,
                topProductState,
                rejectWithValue
            );
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Error fetching top products"
            );
        }
    }
);

//Slice//
const analyticsSlice = createSlice({
    name: "analytics",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            // REVENUE OVER TIME
            .addCase(fetchRevenueOverTime.pending, (state) => {
                state.revenueOverTime.loading = true;
                state.revenueOverTime.error = null;
            })
            .addCase(fetchRevenueOverTime.fulfilled, (state, action) => {
                state.revenueOverTime.rotParams = action.payload.params;
                state.revenueOverTime.rotData = action.payload.data;
                state.revenueOverTime.expiration = generateExpirationTime();
                state.revenueOverTime.loading = false;
            })
            .addCase(fetchRevenueOverTime.rejected, (state, action) => {
                state.revenueOverTime.loading = false;
                state.revenueOverTime.error =
                    action.error.message || "Failed to fetch revenue over time";
            })
            // REVENUE BY LOCATION
            .addCase(fetchRevenueByLocation.pending, (state) => {
                state.revenueByLocation.loading = true;
                state.revenueByLocation.error = null;
            })
            .addCase(fetchRevenueByLocation.fulfilled, (state, action) => {
                state.revenueByLocation.rotParams = action.payload.params;
                state.revenueByLocation.rotData = action.payload.data;
                state.revenueByLocation.expiration = generateExpirationTime();
                state.revenueByLocation.loading = false;
            })
            .addCase(fetchRevenueByLocation.rejected, (state, action) => {
                state.revenueByLocation.loading = false;
                state.revenueByLocation.error =
                    action.error.message ||
                    "Failed to fetch revenue by location";
            })
            // REVENUE PERCENTAGES BY LOCATION
            .addCase(fetchRegionPercentages.pending, (state) => {
                state.regionPercentages.loading = true;
                state.regionPercentages.error = null;
            })
            .addCase(fetchRegionPercentages.fulfilled, (state, action) => {
                state.regionPercentages.rpParams = action.payload.params;
                state.regionPercentages.rpData = action.payload.data;
                state.regionPercentages.expiration = generateExpirationTime();
                state.regionPercentages.loading = false;
            })
            .addCase(fetchRegionPercentages.rejected, (state, action) => {
                state.regionPercentages.loading = false;
                state.regionPercentages.error =
                    action.error.message ||
                    "Failed to fetch revenue percentages by region";
            })
            // REVENUE BY CATEGORY
            .addCase(fetchRevenueByCategory.pending, (state) => {
                state.revenueByCategory.loading = true;
                state.revenueByCategory.error = null;
            })
            .addCase(fetchRevenueByCategory.fulfilled, (state, action) => {
                console.log("fulfilled!");
                console.log(action.payload.data.results);
                state.revenueByCategory.rbcParams = action.payload.params;
                state.revenueByCategory.rbcData = action.payload.data.results;
                if (action.payload.data.stateAbbr) {
                    state.revenueByCategory.stateOrRegion =
                        action.payload.data.stateAbbr;
                } else if (action.payload.data.region) {
                    state.revenueByCategory.stateOrRegion =
                        action.payload.data.region;
                }
                state.revenueByCategory.expiration = generateExpirationTime();
                state.revenueByCategory.loading = false;
            })
            .addCase(fetchRevenueByCategory.rejected, (state, action) => {
                state.revenueByCategory.loading = false;
                state.revenueByCategory.error =
                    action.error.message ||
                    "Failed to fetch revenue by category";
            })
            // REVENUE PERCENTAGES BY CATEGORY
            .addCase(fetchCategoryPercentages.pending, (state) => {
                state.categoryPercentages.loading = true;
                state.categoryPercentages.error = null;
            })
            .addCase(fetchCategoryPercentages.fulfilled, (state, action) => {
                state.categoryPercentages.rbcParams = action.payload.params;
                state.categoryPercentages.rbcData = action.payload.data.results;
                if (action.payload.data.stateAbbr) {
                    state.categoryPercentages.stateOrRegion =
                        action.payload.data.stateAbbr;
                } else if (action.payload.data.region) {
                    state.categoryPercentages.stateOrRegion =
                        action.payload.data.region;
                }
                state.categoryPercentages.expiration = generateExpirationTime();
                state.categoryPercentages.loading = false;
            })
            .addCase(fetchCategoryPercentages.rejected, (state, action) => {
                state.categoryPercentages.loading = false;
                state.categoryPercentages.error =
                    action.error.message ||
                    "Failed to fetch category percentages";
            })
            // SALES SUMMARY
            .addCase(fetchYTD.pending, (state) => {
                state.salesSummary.loading = true;
                state.salesSummary.error = null;
            })
            .addCase(fetchYTD.fulfilled, (state, action) => {
                state.salesSummary.ytdRevenue = action.payload.ytdRevenue;
                state.salesSummary.ytdTransactions =
                    action.payload.ytdTransactions;
                state.salesSummary.mtdRevenue = action.payload.mtdRevenue;
                state.salesSummary.mtdTransactions =
                    action.payload.mtdTransactions;
                state.salesSummary.expiration = generateExpirationTime();
                state.salesSummary.loading = false;
            })
            .addCase(fetchYTD.rejected, (state, action) => {
                state.salesSummary.loading = false;
                state.salesSummary.error =
                    action.error.message || "Failed to fetch sales summary";
            })
            // TRANSACTIONS OVER TIME
            .addCase(fetchTransactionsOverTime.pending, (state) => {
                state.transactionsOverTime.loading = true;
                state.transactionsOverTime.error = null;
            })
            .addCase(fetchTransactionsOverTime.fulfilled, (state, action) => {
                state.transactionsOverTime.totParams = action.payload.params;
                state.transactionsOverTime.totData = action.payload.data;
                state.transactionsOverTime.expiration =
                    generateExpirationTime();
                state.transactionsOverTime.loading = false;
            })
            .addCase(fetchTransactionsOverTime.rejected, (state, action) => {
                state.transactionsOverTime.loading = false;
                state.transactionsOverTime.error =
                    action.error.message ||
                    "Failed to fetch transactions over time";
            })
            // AVERAGE ORDER VALUE
            .addCase(fetchAverageOrderValue.pending, (state) => {
                state.averageOrderValue.loading = true;
                state.averageOrderValue.error = null;
            })
            .addCase(fetchAverageOrderValue.fulfilled, (state, action) => {
                state.averageOrderValue.aovParams = action.payload.params;
                state.averageOrderValue.aovData = action.payload.data;
                state.averageOrderValue.expiration = generateExpirationTime();
                state.averageOrderValue.loading = false;
            })
            .addCase(fetchAverageOrderValue.rejected, (state, action) => {
                state.averageOrderValue.loading = false;
                state.averageOrderValue.error =
                    action.error.message ||
                    "Failed to fetch average order value";
            })
            // ITEMS PER TRANSACTION
            .addCase(fetchItemsPerTransaction.pending, (state) => {
                state.itemsPerTransaction.loading = true;
                state.transactionsOverTime.error = null;
            })
            .addCase(fetchItemsPerTransaction.fulfilled, (state, action) => {
                state.itemsPerTransaction.iptParams = action.payload.params;
                state.itemsPerTransaction.iptData = action.payload.data;
                state.itemsPerTransaction.expiration = generateExpirationTime();
                state.itemsPerTransaction.loading = false;
            })
            .addCase(fetchItemsPerTransaction.rejected, (state, action) => {
                state.itemsPerTransaction.loading = false;
                state.itemsPerTransaction.error =
                    action.error.message ||
                    "Failed to fetch items per transactions";
            })
            // TOP FIVE PRODUCTS
            .addCase(fetchTopFiveProducts.pending, (state) => {
                state.topFiveProducts.loading = true;
                state.topFiveProducts.error = null;
            })
            .addCase(fetchTopFiveProducts.fulfilled, (state, action) => {
                state.topFiveProducts.period = action.payload.period;
                state.topFiveProducts.products = action.payload.products;
                state.topFiveProducts.expiration = generateExpirationTime();
                state.topFiveProducts.loading = false;
            })
            .addCase(fetchTopFiveProducts.rejected, (state, action) => {
                state.topFiveProducts.loading = false;
                state.topFiveProducts.error =
                    action.error.message || "Failed to fetch top five products";
            })
            // TOP TEN PRODUCTS
            .addCase(fetchTopTenProducts.pending, (state) => {
                state.topTenProducts.loading = true;
                state.topTenProducts.error = null;
            })
            .addCase(fetchTopTenProducts.fulfilled, (state, action) => {
                state.topTenProducts.period = action.payload.period;
                state.topTenProducts.products = action.payload.products;
                state.topTenProducts.expiration = generateExpirationTime();
                state.topTenProducts.loading = false;
            })
            .addCase(fetchTopTenProducts.rejected, (state, action) => {
                state.topTenProducts.loading = false;
                state.topTenProducts.error =
                    action.error.message || "Failed to fetch top five products";
            })
            // TOP FIVE PRODUCTS
            .addCase(fetchTopTenWorstProducts.pending, (state) => {
                state.topTenWorstProducts.loading = true;
                state.topTenWorstProducts.error = null;
            })
            .addCase(fetchTopTenWorstProducts.fulfilled, (state, action) => {
                state.topTenWorstProducts.period = action.payload.period;
                state.topTenWorstProducts.products = action.payload.products;
                state.topTenWorstProducts.expiration = generateExpirationTime();
                state.topTenWorstProducts.loading = false;
            })
            .addCase(fetchTopTenWorstProducts.rejected, (state, action) => {
                state.topTenWorstProducts.loading = false;
                state.topTenWorstProducts.error =
                    action.error.message || "Failed to fetch top five products";
            });
    },
});

// export const { setFilters, setProducts } = catalogSlice.actions;
export default analyticsSlice.reducer;
