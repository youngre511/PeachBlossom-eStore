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
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MailIcon from "@mui/icons-material/Mail";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionActions from "@mui/material/AccordionActions";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIconSharp from "@mui/icons-material/ExpandMoreSharp";
import "./admin-nav.css";
import theme from "../../../common/utils/materialUITheme";

const drawerWidth = 240;

interface Props {}
// const AdminNav: React.FC<Props> = () => {
//     return (
//         <nav>
//             <ul className="admin-nav-bar">
//                 <li>
//                     <div className="menu-item">
//                         <DashboardIcon />
//                         <span className="menu-item-text">Dashboard</span>
//                     </div>
//                     <ul className="sub-menu" id="dashboard-menu">
//                         <li>Sales Analytics</li>
//                         <li>Revenue by Period</li>
//                     </ul>
//                 </li>
//                 <li>
//                     <div className="menu-item">
//                         <ProductsIcon />
//                         <span className="menu-item-text">Products</span>
//                     </div>
//                     <ul className="sub-menu" id="products-menu">
//                         <li>Top Products</li>
//                         <li>
//                             <Link to="/products/manage">
//                                 Product Management
//                             </Link>
//                         </li>
//                         <li>Product Categories</li>
//                     </ul>
//                 </li>
//                 <li>
//                     <div className="menu-item">
//                         <InventoryIcon />
//                         <span className="menu-item-text">Inventory</span>
//                     </div>
//                 </li>
//                 <li>
//                     <div className="menu-item">
//                         <OrdersIcon />
//                         <span className="menu-item-text">Orders</span>
//                     </div>
//                 </li>
//                 <li>
//                     <div className="menu-item">
//                         <CustomerIcon />
//                         <span className="menu-item-text">Customers</span>
//                     </div>
//                     <ul className="sub-menu" id="customers-menu">
//                         <li>Customers Overview</li>
//                         <li>Customer Account Management</li>
//                     </ul>
//                 </li>
//                 <li>
//                     <div className="menu-item">
//                         <AdminIcon />
//                         <span className="menu-item-text">Admin Users</span>
//                     </div>
//                 </li>
//                 <li>
//                     <div className="menu-item">
//                         <SettingsIcon />
//                         <span className="menu-item-text">Settings</span>
//                     </div>
//                 </li>
//             </ul>
//         </nav>
//     );
// };

const AdminNav: React.FC<Props> = (props: Props) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [isClosing, setIsClosing] = React.useState(false);
    const [expanded, setExpanded] = React.useState<string | false>(
        "dashboard-menu"
    );

    const handleDrawerClose = () => {
        setIsClosing(true);
        setMobileOpen(false);
    };

    const handleDrawerTransitionEnd = () => {
        setIsClosing(false);
    };

    const handleDrawerToggle = () => {
        if (!isClosing) {
            setMobileOpen(!mobileOpen);
        }
    };

    const handleExpand =
        (menu: string) =>
        (event: React.SyntheticEvent, newExpanded: boolean) => {
            setExpanded(newExpanded ? menu : false);
        };

    const drawer = (
        <div>
            <Toolbar />
            <Divider />
            <List>
                <ListItem disablePadding>
                    <Accordion
                        expanded={expanded === "dashboard-menu"}
                        onChange={handleExpand("dashboard-menu")}
                        disableGutters={true}
                        square={true}
                        sx={{
                            width: "100%",
                            boxShadow: "none",
                            bgcolor: "peach.extraDark",
                            color: "white",
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIconSharp />}
                            id="dashboard-menu"
                        >
                            <ListItemIcon>
                                <DashboardIcon className="menu-svg" />
                            </ListItemIcon>
                            <ListItemText primary={"Dashboard"} />
                        </AccordionSummary>
                        <AccordionDetails
                            sx={{
                                paddingLeft: 3,
                                paddingTop: 2,
                                paddingBottom: 2,
                                bgcolor: "peach.main",
                            }}
                        >
                            <List sx={{ padding: 0 }}>
                                <ListItem
                                    disablePadding
                                    sx={{
                                        marginTop: "5px",
                                        marginBottom: "5px",
                                    }}
                                >
                                    <ListItemText
                                        secondary={"Sales Analytics"}
                                    />
                                </ListItem>
                                <ListItem
                                    disablePadding
                                    sx={{
                                        marginTop: "5px",
                                        marginBottom: "5px",
                                    }}
                                >
                                    <ListItemText
                                        secondary={"Revenue by Period"}
                                    />
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </ListItem>
                <ListItem disablePadding>
                    <Accordion
                        expanded={expanded === "products-menu"}
                        onChange={handleExpand("products-menu")}
                        disableGutters={true}
                        square={true}
                        sx={{
                            width: "100%",
                            boxShadow: "none",
                            bgcolor: "peach.extraDark",
                            color: "white",
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIconSharp />}
                            id="products-menu"
                        >
                            <ListItemIcon>
                                <ProductsIcon className="menu-svg" />
                            </ListItemIcon>
                            <ListItemText primary={"Products"} />
                        </AccordionSummary>
                        <AccordionDetails
                            sx={{
                                paddingLeft: 3,
                                paddingTop: 2,
                                paddingBottom: 2,
                                bgcolor: "peach.main",
                            }}
                        >
                            <List>
                                <ListItem
                                    disablePadding
                                    sx={{
                                        marginTop: "5px",
                                        marginBottom: "5px",
                                    }}
                                >
                                    <ListItemText secondary={"Top Products"} />
                                </ListItem>
                                <ListItem
                                    disablePadding
                                    sx={{
                                        marginTop: "5px",
                                        marginBottom: "5px",
                                    }}
                                >
                                    <ListItemText
                                        secondary={"Product Management"}
                                    />
                                </ListItem>
                                <ListItem
                                    disablePadding
                                    sx={{
                                        marginTop: "5px",
                                        marginBottom: "5px",
                                    }}
                                >
                                    <ListItemText
                                        secondary={"Product Categories"}
                                    />
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon>
                            <InventoryIcon className="menu-svg" />
                        </ListItemIcon>
                        <ListItemText primary={"Inventory"} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon>
                            <OrdersIcon className="menu-svg" />
                        </ListItemIcon>
                        <ListItemText primary={"Orders"} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <Accordion
                        expanded={expanded === "customer-menu"}
                        onChange={handleExpand("customer-menu")}
                        disableGutters={true}
                        square={true}
                        sx={{
                            width: "100%",
                            boxShadow: "none",
                            bgcolor: "peach.extraDark",
                            color: "white",
                        }}
                    >
                        <AccordionSummary
                            expandIcon={<ExpandMoreIconSharp />}
                            id="customer-menu"
                        >
                            <ListItemIcon>
                                <CustomerIcon className="menu-svg" />
                            </ListItemIcon>
                            <ListItemText primary={"Customers"} />
                        </AccordionSummary>
                        <AccordionDetails
                            sx={{
                                paddingLeft: 3,
                                paddingTop: 2,
                                paddingBottom: 2,
                                bgcolor: "peach.main",
                            }}
                        >
                            <List>
                                <ListItem
                                    disablePadding
                                    sx={{
                                        marginTop: "5px",
                                        marginBottom: "5px",
                                    }}
                                >
                                    <ListItemText
                                        secondary={"Customers Overview"}
                                    />
                                </ListItem>
                                <ListItem
                                    disablePadding
                                    sx={{
                                        marginTop: "5px",
                                        marginBottom: "5px",
                                    }}
                                >
                                    <ListItemText
                                        secondary={
                                            "Customer Account Management"
                                        }
                                    />
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon>
                            <AdminIcon className="menu-svg" />
                        </ListItemIcon>
                        <ListItemText primary={"Admin Users"} />
                    </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton>
                        <ListItemIcon>
                            <SettingsIcon className="menu-svg" />
                        </ListItemIcon>
                        <ListItemText primary={"Settings"} />
                    </ListItemButton>
                </ListItem>
            </List>
        </div>
    );

    return (
        <Box sx={{ display: "flex" }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: "none" } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div">
                        Responsive drawer
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="mailbox folders"
            >
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Drawer
                    // container={container}
                    variant="temporary"
                    open={mobileOpen}
                    onTransitionEnd={handleDrawerTransitionEnd}
                    onClose={handleDrawerClose}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: "block", sm: "none" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                            bgcolor: "peach.extraDark",
                            color: "white",
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: "none", sm: "block" },
                        "& .MuiDrawer-paper": {
                            boxSizing: "border-box",
                            width: drawerWidth,
                            bgcolor: "peach.extraDark",
                            color: "white",
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>
        </Box>
    );
};

export default AdminNav;
