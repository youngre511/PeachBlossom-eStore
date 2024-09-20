import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/customerStore";
import axios from "axios";
import {
    Product,
    Filters,
    CatalogState,
    FetchProductsResponse,
} from "./CatalogTypes";
import { arraysEqual } from "../../../common/utils/arraysEqual";

const initialState: CatalogState = {
    singleProduct: null,
    products: [],
    numberOfResults: 0,
    filters: {
        search: null,
        category: null,
        subcategory: null,
        color: null,
        minPrice: null,
        maxPrice: null,
        minWidth: null,
        maxWidth: null,
        minHeight: null,
        maxHeight: null,
        minDepth: null,
        maxDepth: null,
        tags: null,
        material: null,
        sort: "name-ascend",
        page: "1",
    },
    loading: false,
    error: null,
};

//Thunks//

export const fetchProducts = createAsyncThunk<
    FetchProductsResponse,
    { filters: Filters; force?: boolean },
    { state: RootState }
>(
    "catalog/fetchProducts",
    async ({ filters, force = false }, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const itemsPerPage = state.userPreferences.itemsPerPage;
        console.log("itemsPerPage:", itemsPerPage);
        const existingFilters = state.catalog.filters;
        let filterUnchanged = true;

        if (!filters.sort) {
            filters.sort = "name-ascend";
        }
        if (!filters.page) {
            filters.page = "1";
        }

        const keys = Object.keys(filters) as Array<keyof Filters>;
        if (existingFilters && state.catalog.products.length > 0) {
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
                products: state.catalog.products,
                numberOfResults: state.catalog.numberOfResults,
            };
        }

        const params = { ...filters, itemsPerPage: itemsPerPage.toString() };
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/product`,
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

export const fetchOneProduct = createAsyncThunk<
    Product,
    string,
    { state: RootState }
>(
    "catalog/fetchOneProduct",
    async (productNo: string, { getState, rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/product/catalog/${productNo}`
            );
            return response.data.payload;
        } catch (error: any) {
            return rejectWithValue(
                error.response?.data || "Error fetching products"
            );
        }
    }
);

//Slice//
const catalogSlice = createSlice({
    name: "catalog",
    initialState,
    reducers: {
        setProducts: (state, action: PayloadAction<Product[]>) => {
            state.products = action.payload;
        },
        setFilters: (state, action: PayloadAction<Filters>) => {
            state.filters = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProducts.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.filters = action.payload.filters;
                state.products = action.payload.products;
                state.numberOfResults = action.payload.numberOfResults;
                state.loading = false;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to fetch products";
            })
            .addCase(fetchOneProduct.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOneProduct.fulfilled, (state, action) => {
                state.singleProduct = action.payload;
                state.loading = false;
            })
            .addCase(fetchOneProduct.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to fetch products";
            });
    },
});

export const { setFilters, setProducts } = catalogSlice.actions;
export default catalogSlice.reducer;
