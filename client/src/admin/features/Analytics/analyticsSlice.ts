import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
import axios from "axios";
import { AnalyticsState, LineData, ROTParams } from "./analyticsTypes";
import { arraysEqual } from "../../../common/utils/arraysEqual";
import { useNavigate } from "react-router-dom";

const initialState: AnalyticsState = {
    revenueByCategory: {},
    revenueOverTime: {
        rotData: [],
        rotParams: null,
    },
    categoryPercentages: {},
    transactionsOverTime: {},
    itemsPerTransaction: {},
    averageOrderValue: {},
    regionPercentages: {},
    salesSummary: {
        ytdRevenue: "$0.00",
    },
    loading: false,
    error: null,
};

//Thunks//

export const fetchRevenueOverTime = createAsyncThunk<
    { params: ROTParams; data: LineData[] },
    { params: ROTParams; force?: boolean },
    { state: RootState }
>(
    "avCatalog/fetchRevenueOverTime",
    async ({ params, force = false }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const rotState = state.analytics.revenueOverTime;
        const existingParams = rotState.rotParams;
        let paramsUnchanged = true;

        const keys = Object.keys(params) as Array<keyof ROTParams>;
        if (existingParams && rotState.rotData.length > 0) {
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

        if (paramsUnchanged && !force) {
            return {
                params,
                data: rotState.rotData,
            };
        }

        const token = localStorage.getItem("jwtToken"); // Get the token from local storage
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/analytics/rot`,
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

//Slice//
const analyticsSlice = createSlice({
    name: "avCatalog",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchRevenueOverTime.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRevenueOverTime.fulfilled, (state, action) => {
                state.revenueOverTime.rotParams = action.payload.params;
                state.revenueOverTime.rotData = action.payload.data;
                state.loading = false;
            })
            .addCase(fetchRevenueOverTime.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to update inventory";
            });
    },
});

// export const { setFilters, setProducts } = catalogSlice.actions;
export default analyticsSlice.reducer;
