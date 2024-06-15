import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import cartReducer from "../features/Cart/cartSlice";
import catalogReducer from "../features/ProductCatalog/catalogSlice";
import userPreferencesReducer from "../features/UserPreferences/userPreferencesSlice";
import categoriesReducer from "../features/Categories/categoriesSlice";

const persistConfig = {
    key: "root",
    storage,
};

const rootReducer = combineReducers({
    cart: cartReducer,
    categories: categoriesReducer,
    catalog: catalogReducer,
    userPreferences: userPreferencesReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const customerStore = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    FLUSH,
                    REHYDRATE,
                    PAUSE,
                    PERSIST,
                    PURGE,
                    REGISTER,
                ],
            },
        }),
});

export const persistor = persistStore(customerStore);

// Get the type of  store variable
export type AppStore = typeof customerStore;
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];

export default customerStore;
