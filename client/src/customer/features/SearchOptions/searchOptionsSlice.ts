import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/customerStore";
import axios from "axios";
import { SearchOption, SearchOptionsState } from "./SearchOptionsTypes";

const initialState: SearchOptionsState = {
    searchOptions: [],
    error: null,
};

interface OptionsResponse {
    message: string;
    payload: OptionsResponsePayload;
}

interface OptionsResponsePayload {
    success: boolean;
    payload: Array<SearchOption>;
}

export const fetchSearchOptions = createAsyncThunk<
    Array<SearchOption>,
    void,
    { state: RootState }
>("searchOptions/fetchSearchOptions", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get<OptionsResponse>(
            `${process.env.REACT_APP_API_URL}product/search-options`
        );
        const options = response.data.payload.payload;
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
                (state, action: PayloadAction<SearchOption[]>) => {
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
