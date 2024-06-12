import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../features/Cart/cartSlice";
import catalogReducer from "../features/ProductCatalog/catalogSlice";
import userPreferencesReducer from "../features/UserPreferences/userPreferencesSlice";
import categoriesReducer from "../features/Categories/categoriesSlice";

export const customerStore = configureStore({
    reducer: {
        cart: cartReducer,
        categories: categoriesReducer,
        catalog: catalogReducer,
        userPreferences: userPreferencesReducer,
    },
});

// Get the type of  store variable
export type AppStore = typeof customerStore;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export default customerStore;
