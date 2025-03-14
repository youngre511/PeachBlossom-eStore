import React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import "./admin-nav.css";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";
import NavDrawerContents from "./components/NavDrawerContents";

export const drawerWidth = 240;

export interface Props {}

const AdminNav: React.FC<Props> = (props: Props) => {
    const [mobileOpen, setMobileOpen] = React.useState(false);
    const [isClosing, setIsClosing] = React.useState(false);
    const { width } = useWindowSizeContext();

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

    return (
        <Box sx={{ display: "flex", flexShrink: 0 }}>
            <AppBar
                position="fixed"
                sx={{
                    width: `${
                        width! < 750 ? "100%" : `calc(100% - ${drawerWidth}px)`
                    }`,
                    ml: `${width! < 750 ? 0 : drawerWidth}px`,
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{
                            mr: 2,
                            display: width! < 750 ? undefined : "none",
                        }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography
                        sx={{
                            fontFamily: "var(--Delafield)",
                            fontSize: "2.5rem",
                            display: width! < 750 ? "flex" : "none",
                            alignItems: "center",
                            justifyContent: "center",
                            flexGrow: width && width >= 440 ? 1 : undefined,
                            paddingLeft:
                                width && width < 440 ? "14px" : undefined,
                            paddingRight:
                                width && width >= 440 ? "40px" : undefined,
                        }}
                        variant="h6"
                        noWrap
                        component="div"
                    >
                        peach blossom{" "}
                        <span
                            style={{
                                fontFamily: "var(--Playfair)",
                                fontSize: "1.4rem",
                                padding: "0 0 5px 10px",
                            }}
                        >
                            Admin Panel
                        </span>
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="navigation bar"
            >
                {width && width < 750 ? (
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onTransitionEnd={handleDrawerTransitionEnd}
                        onClose={handleDrawerClose}
                        ModalProps={{
                            keepMounted: true, // Better open performance on mobile.
                        }}
                        sx={{
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                width: drawerWidth,
                                bgcolor: "peach.extraDark",
                                color: "white",
                            },
                        }}
                    >
                        <NavDrawerContents />
                    </Drawer>
                ) : (
                    <Drawer
                        variant="permanent"
                        sx={{
                            "& .MuiDrawer-paper": {
                                boxSizing: "border-box",
                                width: drawerWidth,
                                bgcolor: "peach.extraDark",
                                color: "white",
                            },
                        }}
                        open
                    >
                        <NavDrawerContents />
                    </Drawer>
                )}
            </Box>
        </Box>
    );
};

export default AdminNav;
