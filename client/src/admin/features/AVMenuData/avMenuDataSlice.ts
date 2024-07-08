import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/store.js";
import axios from "axios";
import {
    AVCategory,
    AVCategoryFetchResponse,
    AVMenuDataState,
    AVSearchOptionFetchResponse,
} from "./avMenuDataTypes.js";
import { arraysEqual } from "../../../common/utils/arraysEqual.js";

const initialState: AVMenuDataState = {
    categories: [],
    searchOptions: [],
    loading: false,
    error: null,
};

//Thunks//

export const avFetchCategories = createAsyncThunk<
    AVCategory[],
    void,
    { state: RootState }
>("avMenuData/avFetchCategories", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get<AVCategoryFetchResponse>(
            `${process.env.REACT_APP_API_URL}category`
        );
        return response.data.payload;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data || ("Error fetching categories" as string)
        );
    }
});

export const avFetchSearchOptions = createAsyncThunk<
    string[],
    void,
    { state: RootState }
>("avMenuData/avFetchSearchOptions", async (_, { rejectWithValue }) => {
    try {
        console.log("fetching search options");
        const response = await axios.get<AVSearchOptionFetchResponse>(
            `${process.env.REACT_APP_API_URL}product/search-options`
        );
        const options = response.data.payload.map((option) => option.value);
        return options;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data || ("Error fetching categories" as string)
        );
    }
});
// export const updateInventory = createAsyncThunk<
//     AVUpdateInventoryResponse,
//     Record<string, number>,
//     { state: RootState }
// >(
//     "avCatalog/updateInventory",
//     async (
//         updateData: Record<string, number>,
//         { getState, rejectWithValue }
//     ) => {
//         const state = getState() as RootState;
//         const filters = state.avCatalog.filters;

//         try {
//             const response = await axios.put(
//                 `${process.env.REACT_APP_API_URL}inventory/updateStockLevels`,
//                 {
//                     updateData: updateData,
//                     filters: filters,
//                 }
//             );
//             return {
//                 products: response.data.payload.productRecords,
//                 numberOfResults: response.data.payload.totalCount,
//             };
//         } catch (error: any) {
//             return rejectWithValue(
//                 error.response?.data || "Error fetching products"
//             );
//         }
//     }
// );

//Slice//
const menuDataSlice = createSlice({
    name: "avMenuData",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(avFetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                avFetchCategories.fulfilled,
                (state, action: PayloadAction<AVCategory[]>) => {
                    state.loading = false;
                    state.categories = action.payload;
                }
            )
            .addCase(avFetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to update inventory";
            })
            .addCase(avFetchSearchOptions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                avFetchSearchOptions.fulfilled,
                (state, action: PayloadAction<string[]>) => {
                    state.loading = false;
                    state.searchOptions = action.payload;
                }
            )
            .addCase(avFetchSearchOptions.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to update inventory";
            });
    },
});

export default menuDataSlice.reducer;
