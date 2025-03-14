import React, { useEffect, useContext } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../common/utils/materialUITheme";
import AdminNav from "./features/AdminNav/AdminNav";
import ProductManagement from "./features/Product/ProductManagement/ProductManagement";
// import "./style/admin-general.css";
import AddProduct from "./features/Product/AddProduct/AddProduct";
import InventoryManagement from "./features/Product/InventoryManagement/InventoryManagement";
import { useAppDispatch } from "./hooks/reduxHooks";
import {
    avFetchCategories,
    avFetchSearchOptions,
} from "./store/AVMenuData/avMenuDataSlice";
import AVProductDetails from "./features/Product/AVProductDetails/AVProductDetails";
import OrderManagement from "./features/AVOrders/OrderManagement/OrderManagement";
import AVOrderDetails from "./features/AVOrders/AVOrderDetails/AVOrderDetails";
import CategoryManagement from "./features/Product/CategoryManagement/CategoryManagement";
import AdminLogin from "./features/Login/AdminLogin";
import ProtectedRoute from "../common/components/ProtectedRoute/ProtectedRoute";
import { AuthContext } from "../common/contexts/authContext";
import Revenue from "./features/Analytics/Revenue/Revenue";
import HomeRedirect from "./components/HomeRedirect";
import AdminManagement from "./features/Users/AdminManagement/AdminManagement";
import Dashboard from "./features/Analytics/Dashboard/Dashboard";
import TransactionData from "./features/Analytics/TransactionData/TransactionData";
import ProductPerformance from "./features/Analytics/Product Performance/ProductPerformance";
import ChangePassword from "./features/ChangePassword/ChangePassword";
import CustomerManagement from "./features/Users/CustomerManagement/CustomerManagement";
import CustomerOverview from "./features/Users/Customer Overview/CustomerOverview";
import Settings from "./components/Settings/Settings";
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
                                    minimumAccessLevel="limited"
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
                        <Route
                            path="/customer-overview"
                            element={
                                <ProtectedRoute
                                    component={CustomerOverview}
                                    requiredRole="admin"
                                />
                            }
                        />
                        <Route
                            path="/user-settings"
                            element={
                                <ProtectedRoute
                                    component={Settings}
                                    requiredRole="admin"
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
