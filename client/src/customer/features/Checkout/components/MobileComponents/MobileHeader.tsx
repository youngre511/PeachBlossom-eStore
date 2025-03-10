import { Box, Button, Typography } from "@mui/material";
import React from "react";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { useCheckoutTimer } from "../../../../../common/contexts/checkoutTimerContext";

interface MobileHeaderProps {}
const MobileHeader: React.FC<MobileHeaderProps> = () => {
    const { timeLeft } = useCheckoutTimer();
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "row",
                width: "100%",
                justifyContent: "space-between",
            }}
        >
            <Button
                startIcon={<ArrowBackRoundedIcon />}
                component="a"
                href="/shoppingcart"
                sx={{ alignSelf: "start" }}
            >
                Back to cart
            </Button>
            {timeLeft && (
                <Box>
                    <Typography>Time to checkout:</Typography>
                    <Typography>
                        {timeLeft.minutes}:
                        {String(timeLeft.seconds).padStart(2, "0")}
                    </Typography>
                </Box>
            )}
        </Box>
    );
};
export default MobileHeader;
