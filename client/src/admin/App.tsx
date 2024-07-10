import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../common/utils/materialUITheme";
import AdminNav from "./components/AdminNav/AdminNav";
import ProductManagement from "./components/ProductManagement/ProductManagement";
import "./style/admin-general.css";
import AddProduct from "./components/AddProduct/AddProduct";
import InventoryManagement from "./components/InventoryManagement/InventoryManagement";
import { useAppDispatch } from "./hooks/reduxHooks";
import {
    avFetchCategories,
    avFetchSearchOptions,
} from "./features/AVMenuData/avMenuDataSlice";
import AVProductDetails from "./components/AVProductDetails/AVProductDetails";

function AdminApp() {
    const dispatch = useAppDispatch();

    useEffect(() => {
        dispatch(avFetchCategories());
        dispatch(avFetchSearchOptions());
    }, []);
    return (
        <ThemeProvider theme={theme}>
            <div className="app-content">
                <AdminNav />
                <main>
                    <Routes>
                        <Route
                            path="/products/manage"
                            element={<ProductManagement />}
                        />
                        <Route
                            path="/inventory"
                            element={<InventoryManagement />}
                        />
                        <Route path="/products/add" element={<AddProduct />} />
                        <Route
                            path="products/product-details"
                            element={<AVProductDetails />}
                        />
                    </Routes>
                </main>
            </div>
        </ThemeProvider>
    );
}

export default AdminApp;
