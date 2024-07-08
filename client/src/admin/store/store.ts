import { configureStore } from "@reduxjs/toolkit";
import avCatalogReducer from "../features/AVCatalog/avCatalogSlice";
import avMenuDataReducer from "../features/AVMenuData/avMenuDataSlice";

export const adminStore = configureStore({
    reducer: {
        avCatalog: avCatalogReducer,
        avMenuData: avMenuDataReducer,
    },
});

// Get the type of  store variable
export type AppStore = typeof adminStore;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export default adminStore;
