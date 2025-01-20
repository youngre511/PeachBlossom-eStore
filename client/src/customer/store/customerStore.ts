import {
    configureStore,
    combineReducers,
    ThunkAction,
    PayloadAction,
} from "@reduxjs/toolkit";
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
import userDataReducer from "../features/UserData/userDataSlice";
import categoriesReducer from "../features/Categories/categoriesSlice";
import searchOptionsReducer from "../features/SearchOptions/searchOptionsSlice";
import { PersistPartial } from "redux-persist/lib/persistReducer";

const persistConfig = {
    key: "root",
    storage,
};

const rootReducer = combineReducers({
    cart: cartReducer,
    categories: categoriesReducer,
    catalog: catalogReducer,
    userData: userDataReducer,
    searchOptions: searchOptionsReducer,
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

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    RootState & PersistPartial,
    unknown,
    PayloadAction<any> // The type of actions that can be dispatched
>;

export default customerStore;
