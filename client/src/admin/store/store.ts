import { configureStore } from "@reduxjs/toolkit";
import avProductReducer from "../features/Product/avProductSlice";
import avMenuDataReducer from "../features/AVMenuData/avMenuDataSlice";
import avOrderReducer from "../features/AVOrders/avOrdersSlice";
import userReducer from "../features/Users/userSlice";
import analyticsReducer from "../features/Analytics/analyticsSlice";

export const adminStore = configureStore({
    reducer: {
        avProduct: avProductReducer,
        avMenuData: avMenuDataReducer,
        avOrder: avOrderReducer,
        users: userReducer,
        analytics: analyticsReducer,
    },
});

// Get the type of  store variable
export type AppStore = typeof adminStore;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export default adminStore;
