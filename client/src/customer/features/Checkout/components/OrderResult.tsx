import { Button, Stack, Typography } from "@mui/material";
import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../common/contexts/authContext";

interface OrderResultProps {
    placeOrderSuccess: boolean;
    orderNumber: string;
}
const OrderResult: React.FC<OrderResultProps> = ({
    placeOrderSuccess,
    orderNumber,
}) => {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);

    if (placeOrderSuccess === true) {
        <Stack spacing={2} useFlexGap>
            <Typography variant="h1">📦</Typography>
            <Typography variant="h5">Thank you for your order!</Typography>
            <Typography variant="body1" color="text.secondary">
                Your order number is
                <strong>&nbsp;#{orderNumber}</strong>.
                {/* We have
                emailed your order confirmation and will
                update you once its shipped. */}
            </Typography>
            {auth && auth.user && (
                <Button
                    variant="contained"
                    sx={{
                        alignSelf: "start",
                        width: {
                            xs: "100%",
                            sm: "auto",
                        },
                    }}
                    onClick={() => navigate("/orders")}
                >
                    Go to my orders
                </Button>
            )}
        </Stack>;
    } else {
        return (
            <Stack spacing={2} useFlexGap>
                <Typography variant="h5">Oops!</Typography>
                <Typography variant="body1" color="text.secondary">
                    Something went wrong when placing your order. Please try
                    again.
                </Typography>
                <Button
                    variant="contained"
                    sx={{
                        alignSelf: "start",
                        width: { xs: "100%", sm: "auto" },
                    }}
                    onClick={() => navigate("/shoppingcart")}
                >
                    Back to Cart
                </Button>
            </Stack>
        );
    }
};
export default OrderResult;
