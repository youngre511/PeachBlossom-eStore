import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
import axios from "axios";

import {
    CustomerUser,
    AdminUser,
    UserState,
    FetchCustomersResponse,
    FetchAdminsResponse,
    AdminFilters,
    CustomerFilters,
} from "./userTypes";

const initialState: UserState = {
    customers: [],
    admins: [],
    numberOfAdmins: 0,
    numberOfCustomers: 0,
    adminFilters: null,
    customerFilters: null,
    error: null,
    loading: false,
};

//Thunks//

export const fetchAdmins = createAsyncThunk<
    FetchAdminsResponse,
    AdminFilters,
    { state: RootState }
>(
    "users/fetchAdmins",
    async (
        { page, usersPerPage, accessLevel, searchString },
        { getState, rejectWithValue }
    ) => {
        const token = localStorage.getItem("jwtToken");
        try {
            const accessLevelString = accessLevel.join(",");
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/user/admins`,
                {
                    params: {
                        page,
                        usersPerPage,
                        accessLevel: accessLevelString,
                        searchString,
                    },
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            const adminData: FetchAdminsResponse = response.data.payload;
            return {
                ...adminData,
                adminFilters: { page, usersPerPage, accessLevel, searchString },
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Error fetching order details"
            );
        }
    }
);

export const fetchCustomers = createAsyncThunk<
    FetchCustomersResponse,
    CustomerFilters,
    { state: RootState }
>(
    "users/fetchCustomers",
    async (
        { page, usersPerPage, searchString },
        { getState, rejectWithValue }
    ) => {
        const token = localStorage.getItem("jwtToken");
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/user/admins`,
                {
                    params: { page, usersPerPage, searchString },
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            const customerData: FetchCustomersResponse = response.data.payload;
            return {
                ...customerData,
                customerFilters: { page, usersPerPage, searchString },
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Error fetching order details"
            );
        }
    }
);

export const resetUserPassword = createAsyncThunk<
    void,
    {
        user_id: number;
        userRole: "admin" | "customer";
    },
    { state: RootState }
>(
    "users/resetUserPassword",
    async ({ user_id, userRole }, { getState, dispatch, rejectWithValue }) => {
        const token = localStorage.getItem("jwtToken");
        const userState = getState().users;
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/user/resetPassword`,
                { user_id: user_id },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            if (userRole === "customer") {
                await dispatch(
                    fetchCustomers(userState.customerFilters as CustomerFilters)
                );
            } else {
                await dispatch(
                    fetchAdmins(userState.adminFilters as AdminFilters)
                );
            }
            return;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Error resetting user password"
            );
        }
    }
);

export const deleteUser = createAsyncThunk<
    void,
    {
        user_id: number;
        userRole: "admin" | "customer";
    },
    { state: RootState }
>(
    "users/deleteUser",
    async ({ user_id, userRole }, { getState, dispatch, rejectWithValue }) => {
        const token = localStorage.getItem("jwtToken");
        const userState = getState().users;
        try {
            const response = await axios.delete(
                `${import.meta.env.VITE_API_URL}/user/delete/${user_id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            if (userRole === "customer") {
                await dispatch(
                    fetchCustomers(userState.customerFilters as CustomerFilters)
                );
            } else {
                await dispatch(
                    fetchAdmins(userState.adminFilters as AdminFilters)
                );
            }
            return;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Error resetting user password"
            );
        }
    }
);

//Slice//
const userSlice = createSlice({
    name: "users",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        changeAccessLevelOptimistic: (state, action) => {
            const foundIndex = state.admins.findIndex(
                (user) => user.username === action.payload.username
            );
            if (foundIndex !== -1) {
                state.admins[foundIndex] = {
                    ...state.admins[foundIndex],
                    accessLevel: action.payload.newAccessLevel,
                };
            }
        },
        rollbackAccessLevel: (state, action) => {
            const foundIndex = state.admins.findIndex(
                (user) => user.username === action.payload.username
            );
            if (foundIndex !== -1) {
                state.admins[foundIndex] = {
                    ...state.admins[foundIndex],
                    accessLevel: action.payload.oldAccessLevel,
                };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAdmins.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAdmins.fulfilled, (state, action) => {
                state.numberOfAdmins = action.payload.numberOfAdmins;
                state.admins = action.payload.admins;
                state.adminFilters = action.payload.adminFilters;
                state.loading = false;
            })
            .addCase(fetchAdmins.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to update inventory";
            })
            .addCase(fetchCustomers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchCustomers.fulfilled, (state, action) => {
                state.numberOfCustomers = action.payload.numberOfCustomers;
                state.customers = action.payload.customers;
                state.customerFilters = action.payload.customerFilters;
                state.loading = false;
            })
            .addCase(fetchCustomers.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to update inventory";
            })
            .addCase(resetUserPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(resetUserPassword.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(resetUserPassword.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to reset password";
            })
            .addCase(deleteUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteUser.fulfilled, (state, action) => {
                state.loading = false;
            })
            .addCase(deleteUser.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to reset password";
            });
    },
});

export const { clearError, changeAccessLevelOptimistic, rollbackAccessLevel } =
    userSlice.actions;
export default userSlice.reducer;
