import React, { useEffect, useContext } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../common/utils/materialUITheme";
import AdminNav from "./components/AdminNav/AdminNav";
import ProductManagement from "./components/ProductManagement/ProductManagement";
// import "./style/admin-general.css";
import AddProduct from "./components/AddProduct/AddProduct";
import InventoryManagement from "./components/InventoryManagement/InventoryManagement";
import { useAppDispatch } from "./hooks/reduxHooks";
import {
    avFetchCategories,
    avFetchSearchOptions,
} from "./features/AVMenuData/avMenuDataSlice";
import AVProductDetails from "./components/AVProductDetails/AVProductDetails";
import OrderManagement from "./components/OrderManagement/OrderManagement";
import AVOrderDetails from "./components/AVOrderDetails/AVOrderDetails";
import CategoryManagement from "./components/CategoryManagement/CategoryManagement";
import AdminLogin from "./components/Login/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { AuthContext } from "../common/contexts/authContext";
import Sales from "./components/Sales/Sales";
import HomeRedirect from "./components/HomeRedirect";
import AdminManagement from "./components/AdminManagement/AdminManagement";
import Dashboard from "./components/Dashboard/Dashboard";
function AdminApp() {
    const dispatch = useAppDispatch();
    const authContext = useContext(AuthContext);
    useEffect(() => {
        dispatch(avFetchCategories());
        dispatch(avFetchSearchOptions());
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <div className="app-content">
                {authContext &&
                    !authContext.isTokenExpired() &&
                    authContext.user &&
                    authContext.user.role === "admin" && <AdminNav />}
                <main>
                    <Routes>
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute
                                    component={HomeRedirect}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/products/manage"
                            element={
                                <ProtectedRoute
                                    component={ProductManagement}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/sales/dashboard"
                            element={
                                <ProtectedRoute
                                    component={Dashboard}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/inventory"
                            element={
                                <ProtectedRoute
                                    component={InventoryManagement}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/products/add"
                            element={
                                <ProtectedRoute
                                    component={AddProduct}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/products/product-details"
                            element={
                                <ProtectedRoute
                                    component={AVProductDetails}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/orders/manage"
                            element={
                                <ProtectedRoute
                                    component={OrderManagement}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/orders/order-details"
                            element={
                                <ProtectedRoute
                                    component={AVOrderDetails}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/categories"
                            element={
                                <ProtectedRoute
                                    component={CategoryManagement}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/admin-management"
                            element={
                                <ProtectedRoute
                                    component={AdminManagement}
                                    requiredRole="admin"
                                    requiredAccessLevel="full"
                                />
                            }
                        />
                        <Route path="login" element={<AdminLogin />} />
                        <Route
                            path="*"
                            element={
                                <ProtectedRoute
                                    component={HomeRedirect}
                                    requiredRole="admin"
                                />
                            }
                        />
                    </Routes>
                </main>
            </div>
        </ThemeProvider>
    );
}

export default AdminApp;
