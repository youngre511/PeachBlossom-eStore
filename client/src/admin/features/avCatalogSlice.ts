import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../store/store";
import axios from "axios";
import {
    AVProduct,
    AVFilters,
    AVCatalogState,
    AVFetchProductsResponse,
} from "./avCatalogTypes.js";
import { arraysEqual } from "../../common/utils/arraysEqual";

const initialState: AVCatalogState = {
    products: [],
    numberOfResults: 0,
    filters: {
        search: null,
        category: null,
        subCategory: null,
        tags: null,
        sortMethod: "name-ascend",
        page: "1",
        itemsPerPage: "12",
    },
    loading: false,
    error: null,
};

//Thunks//

export const avFetchProducts = createAsyncThunk<
    AVFetchProductsResponse,
    AVFilters,
    { state: RootState }
>(
    "catalog/fetchProducts",
    async (filters: AVFilters, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const existingFilters = state.avCatalog.filters;
        let filterUnchanged = true;

        if (!filters.sortMethod) {
            filters.sortMethod = "name-ascend";
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
            console.log("didn't change");
        }

        if (filterUnchanged) {
            return {
                filters,
                products: state.avCatalog.products,
                numberOfResults: state.avCatalog.numberOfResults,
            };
        }

        const params = { ...filters };
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}product/admin`,
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

//Slice//
const catalogSlice = createSlice({
    name: "catalog",
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
                    action.error.message || "Failed to fetch products";
            });
    },
});

export const { setFilters, setProducts } = catalogSlice.actions;
export default catalogSlice.reducer;
