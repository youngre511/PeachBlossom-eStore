import {configureStore} from '@reduxjs/toolkit';


export const store = configureStore({
    reducer: {

    }
})

// Get the type of  store variable
export type AppStore = typeof store
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']