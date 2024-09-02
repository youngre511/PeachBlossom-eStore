import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import CustomerApp from "./customer/App";
import AdminApp from "./admin/App";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/es/integration/react";
import customerStore, { persistor } from "./customer/store/customerStore";
import adminStore from "./admin/store/store";
import { AuthProvider } from "./common/contexts/authContext";
import { NavigationHistoryProvider } from "./common/contexts/navContext";
import { WindowSizeProvider } from "./common/contexts/windowSizeContext";

const isAdmin = window.location.hostname.startsWith("admin");

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        {!isAdmin ? (
            <Provider store={customerStore}>
                <PersistGate loading={null} persistor={persistor}>
                    <BrowserRouter>
                        <AuthProvider>
                            <NavigationHistoryProvider>
                                <WindowSizeProvider>
                                    <CustomerApp />
                                </WindowSizeProvider>
                            </NavigationHistoryProvider>
                        </AuthProvider>
                    </BrowserRouter>
                </PersistGate>
            </Provider>
        ) : (
            <Provider store={adminStore}>
                <BrowserRouter>
                    <AuthProvider>
                        <NavigationHistoryProvider>
                            <WindowSizeProvider>
                                <AdminApp />
                            </WindowSizeProvider>
                        </NavigationHistoryProvider>
                    </AuthProvider>
                </BrowserRouter>
            </Provider>
        )}
    </StrictMode>
);
