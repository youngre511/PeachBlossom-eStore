import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/customerStore";
import {
    CustomerOrder,
    CustomerOrderFilter,
    OrdersResponse,
    UserDataState,
} from "./UserDataTypes";
import axios from "axios";
import { arraysEqual } from "../../../common/utils/arraysEqual";

const initialState: UserDataState = {
    data: {
        orderList: [],
        numberResults: 0,
        addressList: [],
        orderFilter: { sort: "orderDate-descend", page: "1" },
    },
    preferences: {
        itemsPerPage: 24,
    },
    loading: false,
    error: null,
};

export const getUserOrders = createAsyncThunk<
    OrdersResponse, // Replace with the return type of the thunk
    { customerId: number; force?: boolean; filter: CustomerOrderFilter }, // Replace with the type of the argument passed to the thunk
    { state: RootState }
>(
    "userData/getUserOrders",
    async (
        { customerId, force = false, filter },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as RootState;
            const existingFilters = state.userData.data.orderFilter;
            const itemsPerPage = state.userData.preferences.itemsPerPage;
            let filterUnchanged = true;

            if (!filter.sort) {
                filter.sort = "orderDate-descend";
            }
            if (!filter.page) {
                filter.page = "1";
            }

            const keys = Object.keys(filter) as Array<
                keyof CustomerOrderFilter
            >;
            if (existingFilters && state.catalog.products.length > 0) {
                for (let key of keys) {
                    const currentValue = filter[key];
                    const existingValue = existingFilters[key];
                    if (
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
                    filter,
                    orders: state.userData.data.orderList,
                    numberOfResults: state.userData.data.numberResults,
                };
            }
            console.log("customerId:", customerId);

            const params = {
                customerId: String(customerId),
                itemsPerPage: itemsPerPage,
                ...filter,
            };
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/order/`,
                {
                    params: params,
                }
            );

            return {
                filter: filter,
                orders: response.data.orders,
                numberOfResults: response.data.totalCount,
            };
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error);
        }
    }
);

const userDataSlice = createSlice({
    name: "userData",
    initialState,
    reducers: {
        setItemsPerPage: (state, action: PayloadAction<24 | 48 | 96>) => {
            state.preferences.itemsPerPage = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(getUserOrders.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getUserOrders.fulfilled, (state, action) => {
                state.data.orderList = action.payload.orders;
                state.data.numberResults = action.payload.numberOfResults;
                state.data.orderFilter = action.payload.filter;
                state.loading = false;
            })
            .addCase(getUserOrders.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to fetch user orders";
            });
    },
});

export const { setItemsPerPage } = userDataSlice.actions;
export default userDataSlice.reducer;
