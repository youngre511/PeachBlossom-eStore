import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../common/utils/materialUITheme";
import AdminNav from "./components/AdminNav/AdminNav";
import ProductManagement from "./components/ProductManagement/ProductManagement";
import "./style/admin-general.css";
import AddProduct from "./components/AddProduct/AddProduct";
import InventoryManagement from "./components/InventoryManagement/InventoryManagement";

function AdminApp() {
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
                    </Routes>
                </main>
            </div>
        </ThemeProvider>
    );
}

export default AdminApp;
