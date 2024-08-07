import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
import axios from "axios";
import {
    AVOrderState,
    IAVOrder,
    IAVOrderDetails,
    IAVOrderFilters,
    AVFetchOrdersResponse,
    AVFetchOrdersAPIResponse,
    AVFetchOrderDetailsResponse,
} from "./avOrdersTypes";
import { arraysEqual } from "../../../common/utils/arraysEqual";

const initialState: AVOrderState = {
    orderFilters: {
        sort: "orderDate-descend",
        page: "1",
        itemsPerPage: "24",
    },
    orderList: [],
    numberOfResults: 0,
    orderDetails: null,
    loading: false,
    error: null,
};

//Thunks//

export const avFetchOrders = createAsyncThunk<
    AVFetchOrdersResponse,
    { filters: IAVOrderFilters; force?: boolean },
    { state: RootState }
>(
    "avOrder/avFetchOrders",
    async ({ filters, force = false }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const existingFilters = state.avOrder.orderFilters;
        let filterUnchanged = true;

        if (!filters.sort) {
            filters.sort = "orderDate-descend";
        }
        if (!filters.page) {
            filters.page = "1";
        }

        const keys = Object.keys(filters) as Array<keyof IAVOrderFilters>;
        if (
            existingFilters &&
            Object.keys(existingFilters).length !== keys.length
        ) {
            filterUnchanged = false;
        } else if (existingFilters && state.avOrder.orderList.length > 0) {
            for (let key of keys) {
                const currentValue = filters[key];
                const existingValue = existingFilters[key];

                if (
                    (currentValue && !existingValue) ||
                    (!currentValue && existingValue)
                ) {
                    filterUnchanged = false;
                } else if (
                    Array.isArray(currentValue) &&
                    Array.isArray(existingValue)
                ) {
                    if (!arraysEqual(currentValue, existingValue)) {
                        filterUnchanged = false;
                        break;
                    }
                } else if (currentValue !== existingValue) {
                    filterUnchanged = false;
                    break;
                }
            }
        } else {
            filterUnchanged = false;
        }

        if (filterUnchanged && !force) {
            return {
                orderFilters: filters,
                orderList: state.avOrder.orderList,
                numberOfResults: state.avOrder.numberOfResults,
            };
        }

        const params = { ...filters };
        const token = localStorage.getItem("jwtToken");
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/order`,
                {
                    params: params,
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            if (!response.data) {
                throw new Error("No data returned from server");
            }
            const results: AVFetchOrdersAPIResponse = response.data;
            return {
                orderFilters: filters,
                orderList: results.orders,
                numberOfResults: results.totalCount,
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Error fetching products"
            );
        }
    }
);

export const avFetchOrderDetails = createAsyncThunk<
    AVFetchOrderDetailsResponse,
    string,
    { state: RootState }
>(
    "avOrder/avFetchOrderDetails",
    async (orderNo: string, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        if (
            state.avOrder.orderDetails &&
            state.avOrder.orderDetails.orderNo === orderNo
        ) {
            return {
                orderNo: orderNo,
                details: state.avOrder.orderDetails.details,
            };
        }
        const token = localStorage.getItem("jwtToken");
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/order/${orderNo}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            const orderDetails: IAVOrderDetails = response.data;
            return {
                orderNo: orderNo,
                details: orderDetails,
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Error fetching order details"
            );
        }
    }
);

//Slice//
const orderSlice = createSlice({
    name: "avOrder",
    initialState,
    reducers: {
        setFilters: (state, action: PayloadAction<IAVOrderFilters>) => {
            state.orderFilters = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(avFetchOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(avFetchOrders.fulfilled, (state, action) => {
                state.orderFilters = action.payload.orderFilters;
                state.orderList = action.payload.orderList;
                state.numberOfResults = action.payload.numberOfResults;
                state.loading = false;
            })
            .addCase(avFetchOrders.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to update inventory";
            })
            .addCase(avFetchOrderDetails.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(avFetchOrderDetails.fulfilled, (state, action) => {
                state.orderDetails = action.payload;
                state.loading = false;
            })
            .addCase(avFetchOrderDetails.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to update inventory";
            });
    },
});

export const { setFilters } = orderSlice.actions;
export default orderSlice.reducer;
