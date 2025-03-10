import * as React from "react";

import { styled } from "@mui/system";
import { FormLabel, OutlinedInput } from "@mui/material";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid2";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { CartState } from "../../../Cart/CartTypes";
import { PaymentDetails } from "../../Checkout";
import { ShippingDetails } from "../../../../store/userData/UserDataTypes";

const FormGrid = styled(Grid)(() => ({
    display: "flex",
    flexDirection: "column",
}));

interface ReviewProps {
    cart: CartState;
    shipping: number;
    taxRate: number;
    total: number;
    paymentDetails: PaymentDetails;
    shippingDetails: ShippingDetails;
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
}

const Review: React.FC<ReviewProps> = ({
    cart,
    shipping,
    taxRate,
    total,
    paymentDetails,
    shippingDetails,
    email,
    setEmail,
}) => {
    const streetAddress: string = shippingDetails.shippingAddress2
        ? `${shippingDetails.shippingAddress}, ${shippingDetails.shippingAddress2}`
        : shippingDetails.shippingAddress;

    const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setEmail(event.target.value);
    };

    return (
        <Stack spacing={2}>
            <List disablePadding>
                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText
                        primary="Items"
                        secondary={`Qty ${cart.numberOfItems}`}
                    />
                    <Typography variant="body2">{`$${cart.subTotal}`}</Typography>
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Shipping" />
                    <Typography variant="body2">${shipping}</Typography>
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText
                        primary="Tax"
                        secondary={`${taxRate * 100}%`}
                    />
                    <Typography variant="body2">
                        $
                        {(
                            (Number(cart.subTotal) + Number(shipping)) *
                            Number(taxRate)
                        ).toFixed(2)}
                    </Typography>
                </ListItem>
                <ListItem sx={{ py: 1, px: 0 }}>
                    <ListItemText primary="Total" />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        ${total.toFixed(2)}
                    </Typography>
                </ListItem>
            </List>
            <Divider />
            <Stack
                direction="column"
                divider={<Divider flexItem />}
                spacing={2}
                sx={{ my: 2 }}
            >
                <div>
                    <Typography variant="subtitle2" gutterBottom>
                        Shipment details
                    </Typography>
                    <Typography gutterBottom>
                        {shippingDetails.firstName} {shippingDetails.lastName}
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                        {streetAddress}, {shippingDetails.city},{" "}
                        {shippingDetails.stateAbbr} {shippingDetails.zipCode}
                    </Typography>
                </div>
                <div>
                    <Typography variant="subtitle2" gutterBottom>
                        Payment details
                    </Typography>
                    <Grid container>
                        <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            sx={{ width: "100%", mb: 1 }}
                        >
                            <Typography variant="body1" color="text.secondary">
                                Card type:
                            </Typography>
                            <Typography variant="body2">
                                {paymentDetails.cardType}
                            </Typography>
                        </Stack>
                        <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            sx={{ width: "100%", mb: 1 }}
                        >
                            <Typography variant="body1" color="text.secondary">
                                Card holder:
                            </Typography>
                            <Typography variant="body2">
                                {paymentDetails.cardHolder}
                            </Typography>
                        </Stack>
                        <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            sx={{ width: "100%", mb: 1 }}
                        >
                            <Typography variant="body1" color="text.secondary">
                                Card number:
                            </Typography>
                            <Typography variant="body2">
                                xxxx-xxxx-xxxx-
                                {paymentDetails.cardNumber.slice(-4)}
                            </Typography>
                        </Stack>
                        <Stack
                            direction="row"
                            spacing={1}
                            useFlexGap
                            sx={{ width: "100%", mb: 1 }}
                        >
                            <Typography variant="body1" color="text.secondary">
                                Expiry date:
                            </Typography>
                            <Typography variant="body2">
                                {paymentDetails.expiryDate}
                            </Typography>
                        </Stack>
                    </Grid>
                </div>
                <div>
                    <FormGrid size={{ xs: 12, md: 6 }}>
                        <FormLabel htmlFor="email" required>
                            Email
                        </FormLabel>
                        <OutlinedInput
                            id="email"
                            name="email"
                            type="email"
                            placeholder="someone@example.com"
                            value={email}
                            autoComplete="first name"
                            onChange={handleEmailChange}
                            required
                        />
                    </FormGrid>
                </div>
            </Stack>
        </Stack>
    );
};

export default Review;
