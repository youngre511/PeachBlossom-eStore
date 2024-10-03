import React, { useEffect, useContext } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../common/utils/materialUITheme";
import AdminNav from "./components/AdminNav/AdminNav";
import ProductManagement from "./components/Products/ProductManagement/ProductManagement";
// import "./style/admin-general.css";
import AddProduct from "./components/Products/AddProduct/AddProduct";
import InventoryManagement from "./components/InventoryManagement/InventoryManagement";
import { useAppDispatch } from "./hooks/reduxHooks";
import {
    avFetchCategories,
    avFetchSearchOptions,
} from "./features/AVMenuData/avMenuDataSlice";
import AVProductDetails from "./components/Products/AVProductDetails/AVProductDetails";
import OrderManagement from "./components/OrderManagement/OrderManagement";
import AVOrderDetails from "./components/AVOrderDetails/AVOrderDetails";
import CategoryManagement from "./components/CategoryManagement/CategoryManagement";
import AdminLogin from "./components/Login/AdminLogin";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { AuthContext } from "../common/contexts/authContext";
import Revenue from "./components/SalesAnalytics/Revenue/Revenue";
import HomeRedirect from "./components/HomeRedirect";
import AdminManagement from "./components/AdminManagement/AdminManagement";
import Dashboard from "./components/SalesAnalytics/Dashboard/Dashboard";
import TransactionData from "./components/SalesAnalytics/TransactionData/TransactionData";
import ProductPerformance from "./components/SalesAnalytics/Product Performance/ProductPerformance";
import ChangePassword from "./components/ChangePassword/ChangePassword";
import CustomerManagement from "./components/CustomerManagement/CustomerManagement";
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
                            path="/sales/transactions"
                            element={
                                <ProtectedRoute
                                    component={TransactionData}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/sales/revenue"
                            element={
                                <ProtectedRoute
                                    component={Revenue}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/sales/product-performance"
                            element={
                                <ProtectedRoute
                                    component={ProductPerformance}
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
                                    minimumAccessLevel="full"
                                />
                            }
                        />
                        <Route
                            path="/customer-management"
                            element={
                                <ProtectedRoute
                                    component={CustomerManagement}
                                    requiredRole="admin"
                                    minimumAccessLevel="limited"
                                />
                            }
                        />
                        <Route path="/login" element={<AdminLogin />} />
                        <Route
                            path="/account/password"
                            element={
                                <ProtectedRoute
                                    component={ChangePassword}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/account/password-reset"
                            element={
                                <ProtectedRoute
                                    component={ChangePassword}
                                    requiredRole="admin"
                                />
                            }
                        />
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
