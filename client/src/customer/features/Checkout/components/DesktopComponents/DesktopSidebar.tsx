import { Box, Button, Grid2 as Grid, Typography } from "@mui/material";
import React from "react";
import { useEffect } from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Info from "./Info";
import { useCheckoutTimer } from "../../../../../common/contexts/checkoutTimerContext";
import { CartItem } from "../../../Cart/CartTypes";

interface DesktopSidebarProps {
    activeStep: number;
    steps: string[];
    orderTotal: number;
    currentCartItems: CartItem[];
    cartEdited: boolean;
}
const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
    activeStep,
    steps,
    orderTotal,
    currentCartItems,
    cartEdited,
}) => {
    const { timeLeft } = useCheckoutTimer();
    return (
        <Grid
            sx={{
                display: "flex",
                flexDirection: "column",
                backgroundColor: "background.paper",
                borderRight: { sm: "none", md: "1px solid" },
                borderColor: { sm: "none", md: "divider" },
                alignItems: "start",
                pt: 4,
                px: 10,
                gap: 4,
            }}
            size={{
                xs: 12,
                sm: 5,
                lg: 4,
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "start",
                    flexDirection: "column",
                    height: 60,
                }}
            >
                <Button
                    startIcon={<ArrowBackRoundedIcon />}
                    component="a"
                    href="/shoppingcart"
                    sx={{ ml: "-8px" }}
                >
                    Back to cart
                </Button>
                {timeLeft && activeStep !== steps.length && (
                    <Box>
                        <Typography>Time to checkout:</Typography>
                        <Typography>
                            {timeLeft.minutes}:
                            {String(timeLeft.seconds).padStart(2, "0")}
                        </Typography>
                    </Box>
                )}
            </Box>
            {cartEdited && (
                <Box
                    sx={{
                        backgroundColor: "var(--peaches-and-cream)",
                        padding: "5px",
                    }}
                >
                    <Typography color="info">
                        One or more items in your cart was unavailable or had
                        limited availability. Quantities have been adjusted.
                    </Typography>
                </Box>
            )}
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    flexGrow: 1,
                    width: "100%",
                    maxWidth: 500,
                }}
            >
                <Info totalPrice={orderTotal} items={currentCartItems} />
            </Box>
        </Grid>
    );
};
export default DesktopSidebar;
