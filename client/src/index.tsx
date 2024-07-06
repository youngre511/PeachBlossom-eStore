import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import CustomerApp from "./customer/App";
import AdminApp from "./admin/App";
import reportWebVitals from "./reportWebVitals";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/es/integration/react";
import customerStore, { persistor } from "./customer/store/customerStore";
import adminStore from "./admin/store/store";

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);
root.render(
    <React.StrictMode>
        {/* <Provider store={customerStore}>
            <PersistGate loading={null} persistor={persistor}>
                <BrowserRouter>
                    <CustomerApp />
                </BrowserRouter>
            </PersistGate>
        </Provider> */}
        <Provider store={adminStore}>
            <BrowserRouter>
                <AdminApp />
            </BrowserRouter>
        </Provider>
    </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
