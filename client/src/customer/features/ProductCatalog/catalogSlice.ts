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
    products: [],
    filters: {
        search: null,
        category: null,
        subCategory: null,
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
        sortMethod: "name-ascend",
        page: "1",
    },
    loading: false,
    error: null,
};

//Thunks//

export const fetchProducts = createAsyncThunk<
    FetchProductsResponse,
    Filters,
    { state: RootState }
>(
    "catalog/fetchProducts",
    async (filters: Filters, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const itemsPerPage = state.userPreferences.itemsPerPage;
        const existingFilters = state.catalog.filters;
        let filterUnchanged = true;

        const keys = Object.keys(filters) as Array<keyof Filters>;
        if (existingFilters) {
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

        if (filterUnchanged) {
            return { filters, products: state.catalog.products };
        }

        const params = { ...filters, itemsPerPage: itemsPerPage.toString() };
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}product`,
                {
                    params: params,
                }
            );
            return { filters: filters, products: response.data };
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
                state.loading = false;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to fetch products";
            });
    },
});

export const { setFilters, setProducts } = catalogSlice.actions;
export default catalogSlice.reducer;
