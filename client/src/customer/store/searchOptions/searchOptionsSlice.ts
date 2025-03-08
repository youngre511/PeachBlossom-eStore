import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../customerStore";
import axios from "axios";
import { SearchOptionsState } from "./SearchOptionsTypes";

const initialState: SearchOptionsState = {
    searchOptions: [],
    error: null,
};

interface OptionsResponse {
    message: string;
    payload: Array<string>;
}

interface OptionsResponsePayload {
    success: boolean;
    payload: Array<string>;
}

export const fetchSearchOptions = createAsyncThunk<
    Array<string>,
    void,
    { state: RootState }
>("searchOptions/fetchSearchOptions", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get<OptionsResponse>(
            `${import.meta.env.VITE_API_URL}/product/search-options`
        );
        const options = response.data.payload;

        return options;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data || ("Error fetching search options" as string)
        );
    }
});

const searchOptionsSlice = createSlice({
    name: "searchOptions",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchSearchOptions.pending, (state) => {
                state.error = null;
            })
            .addCase(
                fetchSearchOptions.fulfilled,
                (state, action: PayloadAction<string[]>) => {
                    state.searchOptions = action.payload;
                }
            )
            .addCase(fetchSearchOptions.rejected, (state, action) => {
                state.error =
                    action.error.message || "Failed to fetch search options";
            });
    },
});

export default searchOptionsSlice.reducer;
