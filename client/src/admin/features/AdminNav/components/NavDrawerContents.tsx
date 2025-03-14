/// <reference types="vite-plugin-svgr/client" />

import React, { useContext } from "react";
import DashboardIcon from "../../../../assets/img/dashboard.svg?react";
import CustomerIcon from "../../../../assets/img/customers.svg?react";
import ProductsIcon from "../../../../assets/img/products.svg?react";
import InventoryIcon from "../../../../assets/img/inventory.svg?react";
import OrdersIcon from "../../../../assets/img/orders.svg?react";
import AdminIcon from "../../../../assets/img/admin.svg?react";
import SettingsIcon from "../../../../assets/img/settings.svg?react";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";
import { Divider, List, Toolbar, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import OpenInNewSharpIcon from "@mui/icons-material/OpenInNewSharp";
import StorefrontSharpIcon from "@mui/icons-material/StorefrontSharp";
import { Button } from "@mui/material";
import { Box } from "@mui/material";
import { AuthContext } from "../../../../common/contexts/authContext";
import AdminNavSubitem from "./AdminNavSubitem";
import AdminNavExpandable from "./AdminNavExpandable";
import AdminNavItem from "./AdminNavItem";

export type AdminExpandType =
    | "dashboard-menu"
    | "products-menu"
    | "customer-menu"
    | "none";

interface NavDrawerContentsProps {}
const NavDrawerContents: React.FC<NavDrawerContentsProps> = () => {
    const { width } = useWindowSizeContext();
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    const user = authContext?.user;

    const [expanded, setExpanded] =
        React.useState<AdminExpandType>("dashboard-menu");

    const handleExpand =
        (menu: AdminExpandType) =>
        (event: React.SyntheticEvent, newExpanded: boolean) => {
            setExpanded(newExpanded ? menu : "none");
        };

    return (
        <div className="menu-drawer">
            <div>
                <Toolbar
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    {width && width >= 750 && (
                        <React.Fragment>
                            <Typography
                                sx={{
                                    fontFamily: "var(--Delafield)",
                                    fontSize: "2rem",
                                    marginTop: "5px",
                                    marginBottom: "-20px",
                                    color: "black",
                                }}
                            >
                                peach blossom
                            </Typography>
                            <Typography
                                sx={{
                                    fontFamily: "var(--Playfair)",
                                    margin: 0,
                                    color: "black",
                                }}
                            >
                                Admin Panel
                            </Typography>
                        </React.Fragment>
                    )}
                </Toolbar>
                <Divider />
                <List>
                    <AdminNavExpandable
                        id="dashboard-menu"
                        text="Dashboard"
                        expanded={expanded}
                        handleExpand={handleExpand}
                        Icon={DashboardIcon}
                    >
                        <AdminNavSubitem
                            path="/sales/dashboard"
                            text="Dashboard"
                        />
                        <AdminNavSubitem
                            path="/sales/revenue"
                            text="Revenue Overview"
                        />
                        <AdminNavSubitem
                            path="/sales/transactions"
                            text="Transaction Data"
                        />
                        <AdminNavSubitem
                            path="/sales/product-performance"
                            text="Product Performance"
                        />
                    </AdminNavExpandable>
                    <AdminNavExpandable
                        id="products-menu"
                        text="Products"
                        expanded={expanded}
                        handleExpand={handleExpand}
                        Icon={ProductsIcon}
                    >
                        <AdminNavSubitem
                            path="/products/manage"
                            text="Product Management"
                        />
                        <AdminNavSubitem
                            path="/categories"
                            text="Category Management"
                        />
                    </AdminNavExpandable>
                    <AdminNavItem
                        path="/inventory"
                        text="Inventory"
                        Icon={InventoryIcon}
                    />
                    <AdminNavItem
                        path="/orders/manage"
                        text="Orders"
                        Icon={OrdersIcon}
                    />
                    <AdminNavExpandable
                        id="customer-menu"
                        text="Customers"
                        expanded={expanded}
                        handleExpand={handleExpand}
                        Icon={CustomerIcon}
                    >
                        <AdminNavSubitem
                            path="/customer-overview"
                            text="Customer Overview"
                        />
                        <AdminNavSubitem
                            path="/customer-management"
                            text="Customer Management"
                        />
                    </AdminNavExpandable>
                    <AdminNavItem
                        path="/admin-management"
                        text="Admin Management"
                        Icon={AdminIcon}
                    />
                    <AdminNavItem
                        path="/user-settings"
                        text="Settings"
                        Icon={SettingsIcon}
                    />
                    <AdminNavItem
                        url="https://pb.ryanyoung.codes"
                        text="To Storefront"
                        Icon={StorefrontSharpIcon}
                    />
                    <AdminNavItem
                        url="https://ryanyoung.codes"
                        text="To My Portfolio"
                        Icon={OpenInNewSharpIcon}
                    />
                </List>
            </div>
            <Box className="currentUserDetails" sx={{ paddingLeft: 2 }}>
                {user && (
                    <React.Fragment>
                        <div className="name-and-access">
                            <div className="username-display">
                                <span>Username:</span>
                                <span>{user.username}</span>
                            </div>
                            <div className="access-level-display">
                                <span>Access Level:</span>
                                <span>{user.accessLevel} access</span>
                            </div>
                        </div>
                        <Button
                            onClick={authContext.logout}
                            variant="contained"
                            sx={{ bgcolor: "peach.main" }}
                            id={"logout"}
                        >
                            Log Out
                        </Button>
                    </React.Fragment>
                )}
            </Box>
        </div>
    );
};
export default NavDrawerContents;
