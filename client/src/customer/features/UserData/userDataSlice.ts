import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/customerStore";
import {
    ActivityRecord,
    CustomerAddress,
    CustomerOrderFilter,
    OrdersResponse,
    RecentView,
    UserDataState,
} from "./UserDataTypes";
import axios from "axios";
import { arraysEqual } from "../../../common/utils/arraysEqual";
import { ShippingDetails } from "../../components/Checkout/Checkout";
import { pushActivityLogs } from "./userDataTrackingThunks";

const initialState: UserDataState = {
    data: {
        orderList: [],
        numberResults: 0,
        addressList: [],
        orderFilter: { sort: "orderDate-descend", page: "1" },
        currentOrderNo: null,
        recentlyViewed: [],
    },
    preferences: {
        itemsPerPage: 24,
        allowTracking: false,
    },
    activity: [],
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
                itemsPerPage: 10,
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
    CustomerAddress[],
    { force?: boolean },
    { state: RootState }
>(
    "userData/getCustomerAddresses",
    async ({ force = false }, { getState, rejectWithValue }) => {
        try {
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

            for (let address of addressList) {
                const splitShippingAddress =
                    address.shippingAddress.split(" | ");
                address.shippingAddress1 = splitShippingAddress[0];
                if (splitShippingAddress[1])
                    address.shippingAddress2 = splitShippingAddress[1];
                delete address.shippingAddress;
            }

            return addressList;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error);
        }
    }
);

export const removeAddress = createAsyncThunk<
    CustomerAddress[],
    { addressId: number },
    { state: RootState }
>(
    "userData/removeAddress",
    async ({ addressId }, { rejectWithValue, dispatch }) => {
        try {
            dispatch(removeAddressOptimistic(addressId));

            const token = localStorage.getItem("jwtToken");

            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/user/customer/removeAddress`,
                { addressId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );

            const addressList = response.data.payload;

            for (let address of addressList) {
                const splitShippingAddress =
                    address.shippingAddress.split(" | ");
                address.shippingAddress1 = splitShippingAddress[0];
                if (splitShippingAddress[1])
                    address.shippingAddress2 = splitShippingAddress[1];
                delete address.shippingAddress;
            }

            return addressList;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error);
        }
    }
);

export const editAddress = createAsyncThunk<
    CustomerAddress[],
    { addressId: number; address: ShippingDetails; nickname: string },
    { state: RootState }
>(
    "userData/editAddress",
    async ({ addressId, address, nickname }, { rejectWithValue }) => {
        try {
            const token = localStorage.getItem("jwtToken");

            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/user/customer/editAddress`,
                { address, nickname, addressId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );

            const addressList = response.data.payload;

            for (let address of addressList) {
                const splitShippingAddress =
                    address.shippingAddress.split(" | ");
                address.shippingAddress1 = splitShippingAddress[0];
                if (splitShippingAddress[1])
                    address.shippingAddress2 = splitShippingAddress[1];
                delete address.shippingAddress;
            }

            return addressList;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error);
        }
    }
);

export const addAddress = createAsyncThunk<
    CustomerAddress[],
    { address: ShippingDetails; nickname: string },
    { state: RootState }
>("userData/addAddress", async ({ address, nickname }, { rejectWithValue }) => {
    try {
        const token = localStorage.getItem("jwtToken");

        const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/user/customer/addAddress`,
            { address, nickname },
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
            }
        );

        const addressList = response.data.payload;

        for (let address of addressList) {
            const splitShippingAddress = address.shippingAddress.split(" | ");
            address.shippingAddress1 = splitShippingAddress[0];
            if (splitShippingAddress[1])
                address.shippingAddress2 = splitShippingAddress[1];
            delete address.shippingAddress;
        }

        return addressList;
    } catch (error: any) {
        return rejectWithValue(error.response?.data || error);
    }
});

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
            return {
                ...initialState,
                preferences: currentPreferences,
            };
        },
        removeAddressOptimistic: (state, action: PayloadAction<number>) => {
            state.data.addressList = state.data.addressList.filter(
                (address) => address.address_id !== action.payload
            );
        },
        setAllowTracking: (state, action: PayloadAction<boolean>) => {
            state.preferences.allowTracking = action.payload;
        },
        addActivity: (state, action: PayloadAction<ActivityRecord[]>) => {
            state.activity = [...action.payload, ...state.activity];
        },
        updateRecent: (state, action: PayloadAction<RecentView[]>) => {
            console.log("Updating recent:", action.payload);
            state.data.recentlyViewed = action.payload;
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
            })
            .addCase(removeAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(removeAddress.fulfilled, (state, action) => {
                state.data.addressList = action.payload;
                state.loading = false;
            })
            .addCase(removeAddress.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to fetch user orders";
            })
            .addCase(editAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(editAddress.fulfilled, (state, action) => {
                state.data.addressList = action.payload;
                state.loading = false;
            })
            .addCase(editAddress.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to fetch user orders";
            })
            .addCase(addAddress.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addAddress.fulfilled, (state, action) => {
                state.data.addressList = action.payload;
                state.loading = false;
            })
            .addCase(addAddress.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to fetch user orders";
            })
            .addCase(pushActivityLogs.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(pushActivityLogs.fulfilled, (state) => {
                state.activity = [];
                state.loading = false;
            })
            .addCase(pushActivityLogs.rejected, (state, action) => {
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
    removeAddressOptimistic,
    setAllowTracking,
    addActivity,
    updateRecent,
} = userDataSlice.actions;
export default userDataSlice.reducer;
