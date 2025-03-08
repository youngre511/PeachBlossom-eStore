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
import catalogReducer from "../features/Shop/catalogSlice";
import userDataReducer from "./userData/userDataSlice";
import categoriesReducer from "./categories/categoriesSlice";
import searchOptionsReducer from "../features/Navigation/store/searchOptionsSlice";
import { PersistPartial } from "redux-persist/lib/persistReducer";

const PERSIST_VERSION = 1;

const persistConfig = {
    key: "root",
    storage,
    version: PERSIST_VERSION,
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

persistor.subscribe(() => {
    const state = customerStore.getState();
    const currentVersion = state._persist?.version;

    if (!currentVersion || currentVersion !== PERSIST_VERSION) {
        console.log("Version mismatch detected. Clearing persisted store...");
        persistor.purge();
        window.location.reload();
    }
});

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
