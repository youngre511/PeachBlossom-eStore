import React from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as DashboardIcon } from "../../../assets/img/dashboard.svg";
import { ReactComponent as CustomerIcon } from "../../../assets/img/customers.svg";
import { ReactComponent as ProductsIcon } from "../../../assets/img/products.svg";
import { ReactComponent as InventoryIcon } from "../../../assets/img/inventory.svg";
import { ReactComponent as OrdersIcon } from "../../../assets/img/orders.svg";
import { ReactComponent as AdminIcon } from "../../../assets/img/admin.svg";
import { ReactComponent as SettingsIcon } from "../../../assets/img/settings.svg";
import "./admin-nav.css";

interface Props {}
const AdminNav: React.FC<Props> = () => {
    return (
        <nav>
            <ul className="admin-nav-bar">
                <li>
                    <div className="menu-item">
                        <DashboardIcon />
                        <span className="menu-item-text">Dashboard</span>
                    </div>
                    <ul className="sub-menu" id="dashboard-menu">
                        <li>Sales Analytics</li>
                        <li>Revenue by Period</li>
                    </ul>
                </li>
                <li>
                    <div className="menu-item">
                        <ProductsIcon />
                        <span className="menu-item-text">Products</span>
                    </div>
                    <ul className="sub-menu" id="products-menu">
                        <li>Top Products</li>
                        <li>Product Management</li>
                        <li>
                            <Link to="/products/manage">
                                Product Categories
                            </Link>
                        </li>
                    </ul>
                </li>
                <li>
                    <div className="menu-item">
                        <InventoryIcon />
                        <span className="menu-item-text">Inventory</span>
                    </div>
                </li>
                <li>
                    <div className="menu-item">
                        <OrdersIcon />
                        <span className="menu-item-text">Orders</span>
                    </div>
                </li>
                <li>
                    <div className="menu-item">
                        <CustomerIcon />
                        <span className="menu-item-text">Customers</span>
                    </div>
                    <ul className="sub-menu" id="customers-menu">
                        <li>Customers Overview</li>
                        <li>Customer Account Management</li>
                    </ul>
                </li>
                <li>
                    <div className="menu-item">
                        <AdminIcon />
                        <span className="menu-item-text">Admin Users</span>
                    </div>
                </li>
                <li>
                    <div className="menu-item">
                        <SettingsIcon />
                        <span className="menu-item-text">Settings</span>
                    </div>
                </li>
            </ul>
        </nav>
    );
};
export default AdminNav;
