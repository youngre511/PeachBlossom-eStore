import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState } from "../../store/customerStore";
import { UserDataState } from "./UserDataTypes";

const initialState: UserDataState = {
    data: {
        orderList: [],
        addressList: [],
    },
    preferences: {
        itemsPerPage: 24,
    },
};

const userDataSlice = createSlice({
    name: "userData",
    initialState,
    reducers: {
        setItemsPerPage: (state, action: PayloadAction<24 | 48 | 96>) => {
            state.preferences.itemsPerPage = action.payload;
        },
    },
});

export const { setItemsPerPage } = userDataSlice.actions;
export default userDataSlice.reducer;
