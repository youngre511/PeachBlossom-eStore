import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../common/utils/materialUITheme";
import AdminNav from "./components/AdminNav/AdminNav";
import ProductManagement from "./components/ProductManagement/ProductManagement";

function AdminApp() {
    return (
        <ThemeProvider theme={theme}>
            "Hello"
            <AdminNav />
            <Routes>
                <Route
                    path="/products/manage"
                    element={<ProductManagement />}
                />
            </Routes>
        </ThemeProvider>
    );
}

export default AdminApp;
