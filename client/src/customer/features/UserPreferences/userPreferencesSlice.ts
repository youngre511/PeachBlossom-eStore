import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/customerStore";

const initialState: any = {
    itemsPerPage: 24,
};

const userPreferencesSlice = createSlice({
    name: "userPreferences",
    initialState,
    reducers: {
        setItemsPerPage: (state, action: PayloadAction<24 | 48 | 96>) => {
            state.itemsPerPage = action.payload;
            console.log(action.payload);
        },
    },
});

export const { setItemsPerPage } = userPreferencesSlice.actions;
export default userPreferencesSlice.reducer;
