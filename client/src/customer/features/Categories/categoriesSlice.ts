import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../../store/customerStore";
import {
    Category,
    CategoryState,
    FetchCategoriesResponse,
} from "./CategoriesTypes";

const initialState: CategoryState = {
    categories: [],
    loading: false,
    error: null,
};

export const fetchCategories = createAsyncThunk<
    Category[],
    void,
    { state: RootState }
>("categories/fetchCategories", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get<FetchCategoriesResponse>(
            `${import.meta.env.VITE_API_URL}/category`
        );
        return response.data.payload;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data || ("Error fetching categories" as string)
        );
    }
});

const categoriesSlice = createSlice({
    name: "categories",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(
                fetchCategories.fulfilled,
                (state, action: PayloadAction<Category[]>) => {
                    state.loading = false;
                    state.categories = action.payload;
                }
            )
            .addCase(fetchCategories.rejected, (state, action) => {
                state.loading = false;
                state.error =
                    action.error.message || "Failed to fetch categories";
            });
    },
});

export default categoriesSlice.reducer;
