import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "../features/Cart/cartSlice";
import catalogueReducer from "../features/ProductCatalogue/catalogueSlice";
import userPreferencesReducer from "../features/UserPreferences/userPreferencesSlice";

export const store = configureStore({
    reducer: {
        cart: cartReducer,
        catalogue: catalogueReducer,
        userPreferences: userPreferencesReducer,
    },
});

// Get the type of  store variable
export type AppStore = typeof store;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export default store;
