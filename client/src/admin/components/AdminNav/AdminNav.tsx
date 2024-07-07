import React from "react";
import { useNavigate } from "react-router-dom";
import { ReactComponent as DashboardIcon } from "../../../assets/img/dashboard.svg";
import { ReactComponent as CustomerIcon } from "../../../assets/img/customers.svg";
import { ReactComponent as ProductsIcon } from "../../../assets/img/products.svg";
import { ReactComponent as InventoryIcon } from "../../../assets/img/inventory.svg";
import { ReactComponent as OrdersIcon } from "../../../assets/img/orders.svg";
import { ReactComponent as AdminIcon } from "../../../assets/img/admin.svg";
import { ReactComponent as SettingsIcon } from "../../../assets/img/settings.svg";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIconSharp from "@mui/icons-material/ExpandMoreSharp";
import "./admin-nav.css";

export const drawerWidth = 240;

export interface Props {}

const AdminNav: React.FC<Props> = (props: Props) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [isClosing, setIsClosing] = React.useState(false);
    const [expanded, setExpanded] = React.useState<string | false>(
        "dashboard-menu"
    );
    const navigate = useNavigate();

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
                                padding: 0,
                                bgcolor: "peach.main",
                            }}
                        >
                            <List sx={{ padding: 0 }}>
                                <ListItem disablePadding>
                                    <ListItemButton sx={{ paddingLeft: 2 }}>
                                        <ListItemText
                                            secondary={"Sales Analytics"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton sx={{ paddingLeft: 2 }}>
                                        <ListItemText
                                            secondary={"Revenue by Period"}
                                        />
                                    </ListItemButton>
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
                                padding: 0,
                                bgcolor: "peach.main",
                            }}
                        >
                            <List>
                                <ListItem disablePadding>
                                    <ListItemButton sx={{ paddingLeft: 2 }}>
                                        <ListItemText
                                            secondary={"Top Products"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton
                                        sx={{ paddingLeft: 2 }}
                                        onClick={() =>
                                            navigate("/products/manage")
                                        }
                                    >
                                        <ListItemText
                                            secondary={"Product Management"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton sx={{ paddingLeft: 2 }}>
                                        <ListItemText
                                            secondary={"Product Categories"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            </List>
                        </AccordionDetails>
                    </Accordion>
                </ListItem>
                <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate("/inventory")}>
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
                                padding: 0,
                                bgcolor: "peach.main",
                            }}
                        >
                            <List>
                                <ListItem disablePadding>
                                    <ListItemButton sx={{ paddingLeft: 2 }}>
                                        <ListItemText
                                            secondary={"Customers Overview"}
                                        />
                                    </ListItemButton>
                                </ListItem>
                                <ListItem disablePadding>
                                    <ListItemButton sx={{ paddingLeft: 2 }}>
                                        <ListItemText
                                            secondary={
                                                "Customer Account Management"
                                            }
                                        />
                                    </ListItemButton>
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
        <Box sx={{ display: "flex", flexShrink: 0 }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { sm: `calc(100% - ${drawerWidth}px)` },
                    ml: { sm: `${drawerWidth}px` },
                    display: { xs: "block", sm: "none" },
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
                aria-label="navigation bar"
            >
                {/* The implementation can be swapped with js to avoid SEO duplication of links. */}
                <Drawer
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
