import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/customerStore";
import {
    CustomerAddress,
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
        currentOrderNo: null,
    },
    preferences: {
        itemsPerPage: 24,
    },
    loading: false,
    error: null,
};

export const getUserOrders = createAsyncThunk<
    OrdersResponse,
    { customerId: number; force?: boolean; filter: CustomerOrderFilter },
    { state: RootState }
>(
    "userData/getUserOrders",
    async (
        { customerId, force = false, filter },
        { getState, rejectWithValue }
    ) => {
        try {
            const token = localStorage.getItem("jwtToken");
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
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
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

export const getCustomerAddresses = createAsyncThunk<
    CustomerAddress[], // Replace with the return type of the thunk
    { force?: boolean }, // Replace with the type of the argument passed to the thunk
    { state: RootState }
>(
    "userData/getCustomerAddresses",
    async ({ force = false }, { getState, rejectWithValue }) => {
        try {
            console.log("Getting Addresses");
            const state = getState() as RootState;
            const addresses = state.userData.data.addressList;
            const token = localStorage.getItem("jwtToken");

            if (addresses.length > 0 && !force) {
                return addresses;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/user/customer/addresses`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );

            const addressList = response.data.payload;

            console.log("addresslist before:", addressList);
            for (let address of addressList) {
                const splitShippingAddress =
                    address.shippingAddress.split(" | ");
                address.shippingAddress1 = splitShippingAddress[0];
                if (splitShippingAddress[1])
                    address.shippingAddress2 = splitShippingAddress[1];
                delete address.shippingAddress;
            }

            console.log("addressListAfter:", addressList);
            return addressList;
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
        setCurrentOrderNo: (state, action: PayloadAction<string>) => {
            state.data.currentOrderNo = action.payload;
        },
        clearCurrentOrderNo: (state) => {
            state.data.currentOrderNo = null;
        },
        resetUserData: (state) => {
            let currentPreferences = state.preferences;
            state = {
                ...initialState,
                preferences: currentPreferences,
            };
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
            })
            .addCase(getCustomerAddresses.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getCustomerAddresses.fulfilled, (state, action) => {
                state.data.addressList = action.payload;
                state.loading = false;
            })
            .addCase(getCustomerAddresses.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to fetch user orders";
            });
    },
});

export const {
    setItemsPerPage,
    setCurrentOrderNo,
    clearCurrentOrderNo,
    resetUserData,
} = userDataSlice.actions;
export default userDataSlice.reducer;
