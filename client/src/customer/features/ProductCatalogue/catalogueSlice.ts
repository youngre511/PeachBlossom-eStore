import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/store";
import axios from "axios";
import {
    Product,
    Filters,
    CatalogueState,
    FetchProductsResponse,
} from "./CatalogueTypes";
import { arraysEqual } from "../../../common/utils/arraysEqual";

const initialState: CatalogueState = {
    products: [],
    filters: {
        search: null,
        category: null,
        size: null,
        color: null,
        minPrice: null,
        maxPrice: null,
        minWidth: null,
        maxWidth: null,
        minHeight: null,
        maxHeight: null,
        minDepth: null,
        maxDepth: null,
        minCircum: null,
        maxCircum: null,
        minDiam: null,
        maxDiam: null,
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
    "catalogue/fetchProducts",
    async (filters: Filters, { getState, rejectWithValue }) => {
        const state = getState() as RootState;
        const itemsPerPage = state.userPreferences.itemsPerPage;
        const currentFilters = state.catalogue.filters;
        let filterUnchanged = true;

        const keys = Object.keys(filters) as Array<keyof Filters>;
        if (state.catalogue.filters) {
            for (let key of keys) {
                const currentValue = filters[key];
                const existingValue = state.catalogue.filters[key];
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
            return { filters, products: state.catalogue.products };
        }

        const params = { ...filters, itemsPerPage: itemsPerPage.toString() };
        try {
            const response = await axios.get(
                "https://api.peachblossom.ryanyoung.codes/product",
                { params: params }
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
const catalogueSlice = createSlice({
    name: "catalogue",
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

export const { setFilters, setProducts } = catalogueSlice.actions;
export default catalogueSlice.reducer;
