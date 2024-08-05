import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
import axios from "axios";
import {
    AVProduct,
    AVFilters,
    AVCatalogState,
    AVFetchProductsResponse,
    AVUpdateInventoryResponse,
} from "./avCatalogTypes";
import { arraysEqual } from "../../../common/utils/arraysEqual";

const initialState: AVCatalogState = {
    products: [],
    numberOfResults: 0,
    filters: {
        search: null,
        category: null,
        subCategory: null,
        tags: null,
        sort: "name-ascend",
        page: "1",
        view: "active",
        itemsPerPage: "24",
    },
    loading: false,
    error: null,
};

//Thunks//

export const avFetchProducts = createAsyncThunk<
    AVFetchProductsResponse,
    { filters: AVFilters; force?: boolean },
    { state: RootState }
>(
    "avCatalog/avFetchProducts",
    async ({ filters, force = false }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const existingFilters = state.avCatalog.filters;
        let filterUnchanged = true;

        if (!filters.sort) {
            filters.sort = "name-ascend";
        }
        if (!filters.page) {
            filters.page = "1";
        }

        const keys = Object.keys(filters) as Array<keyof AVFilters>;
        if (existingFilters && state.avCatalog.products.length > 0) {
            for (let key of keys) {
                const currentValue = filters[key];
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
                filters,
                products: state.avCatalog.products,
                numberOfResults: state.avCatalog.numberOfResults,
            };
        }

        const params = { ...filters };
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/product/admin`,
                {
                    params: params,
                }
            );
            return {
                filters: filters,
                products: response.data.payload.productRecords,
                numberOfResults: response.data.payload.totalCount,
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Error fetching products"
            );
        }
    }
);

export const updateInventory = createAsyncThunk<
    AVUpdateInventoryResponse,
    Record<string, number>,
    { state: RootState }
>(
    "avCatalog/updateInventory",
    async (
        updateData: Record<string, number>,
        { getState, rejectWithValue }
    ) => {
        const state = getState() as RootState;
        const filters = state.avCatalog.filters;

        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/inventory/updateStockLevels`,
                {
                    updateData: updateData,
                    filters: filters,
                }
            );
            return {
                products: response.data.payload.productRecords,
                numberOfResults: response.data.payload.totalCount,
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Error fetching products"
            );
        }
    }
);

export const updateProductStatus = createAsyncThunk<
    { success: boolean; productNos: string[]; newStatus: string },
    { productNos: string[]; newStatus: string },
    { state: RootState }
>(
    "avCatalog/updateProductStatus",
    async (
        updateData: { productNos: string[]; newStatus: string },
        { getState, rejectWithValue }
    ) => {
        const state = getState() as RootState;
        const filters = state.avCatalog.filters;
        try {
            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/product/update-status`,
                updateData
            );
            return {
                success: response.data.success,
                ...updateData,
            };
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Error fetching products"
            );
        }
    }
);

//Slice//
const catalogSlice = createSlice({
    name: "avCatalog",
    initialState,
    reducers: {
        setProducts: (state, action: PayloadAction<AVProduct[]>) => {
            state.products = action.payload;
        },
        setFilters: (state, action: PayloadAction<AVFilters>) => {
            state.filters = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(avFetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(avFetchProducts.fulfilled, (state, action) => {
                state.filters = action.payload.filters;
                state.products = action.payload.products;
                state.numberOfResults = action.payload.numberOfResults;
                state.loading = false;
            })
            .addCase(avFetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to update inventory";
            })
            .addCase(updateInventory.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateInventory.fulfilled, (state, action) => {
                console.log("updating products with", action.payload.products);
                state.products = action.payload.products;
                state.numberOfResults = action.payload.numberOfResults;
                state.loading = false;
            })
            .addCase(updateInventory.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to update inventory";
            })
            .addCase(updateProductStatus.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateProductStatus.fulfilled, (state, action) => {
                console.log("success:", action.payload.success);
                state.products = state.products.map((product) => {
                    if (action.payload.productNos.includes(product.productNo)) {
                        const newProduct = {
                            ...product,
                            status: action.payload.newStatus,
                        };
                        return newProduct;
                    } else {
                        return product;
                    }
                });
                state.loading = false;
            })
            .addCase(updateProductStatus.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to update inventory";
            });
    },
});

export const { setFilters, setProducts } = catalogSlice.actions;
export default catalogSlice.reducer;
