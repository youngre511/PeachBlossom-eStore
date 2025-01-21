import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid2";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import Typography from "@mui/material/Typography";

import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import AddressForm from "../AddressForm/AddressForm";
import Info from "./Info";
import InfoMobile from "./InfoMobile";
import PaymentForm from "./PaymentForm";
import Review from "./Review";
import { useAppSelector, useAppDispatch } from "../../hooks/reduxHooks";
import { RootState } from "../../store/customerStore";
import axios, { AxiosError } from "axios";
import {
    syncCart,
    clearCart,
    setExpirationTime,
    holdCartStock,
    setCartChangesMade,
} from "../../features/Cart/cartSlice";
import { CartState } from "../../features/Cart/CartTypes";
import "./checkout.css";
import { useCheckoutTimer } from "../../../common/contexts/checkoutTimerContext";
import BlankPopup from "../../../common/components/BlankPopup";
import { AuthContext } from "../../../common/contexts/authContext";
import { validStates } from "../AddressForm/AddressForm";
import {
    logActivity,
    pushActivityLogs,
} from "../../features/UserData/userDataTrackingThunks";

export interface PaymentDetails {
    cardType: string;
    cardHolder: string;
    cardNumber: string;
    cvv: string;
    expiryDate: string;
}

export interface ShippingDetails {
    shippingAddress: string;
    shippingAddress2: string;
    firstName: string;
    lastName: string;
    zipCode: string;
    phoneNumber: string;
    stateAbbr: string;
    city: string;
}

interface OrderData {
    cartId: number | null;
    customerId?: number;
    shipping: ShippingDetails;
    email: string;
    orderDetails: {
        subTotal: number;
        shipping: number;
        tax: number;
        totalAmount: number;
        items: Array<{
            productNo: string;
            quantity: number;
            priceAtCheckout: number;
        }>;
    };
}

const steps = ["Shipping address", "Payment details", "Review your order"];

const Checkout: React.FC = () => {
    const dispatch = useAppDispatch();
    const auth = useContext(AuthContext);
    const [activeStep, setActiveStep] = useState(0);
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
        cardType: "Visa",
        cardHolder: "",
        cardNumber: "1234 5678 9012 3456",
        cvv: "123",
        expiryDate: "",
    });
    const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
        shippingAddress: "",
        shippingAddress2: "",
        firstName: "",
        lastName: "",
        zipCode: "",
        phoneNumber: "",
        stateAbbr: "",
        city: "",
    });
    const [email, setEmail] = useState<string>("");
    const shippingRate = 9.99;
    const taxRate = 0.06;
    const cart = useAppSelector((state: RootState) => state.cart);
    const [currentCartId, setCurrentCartId] = useState(cart.cartId);
    const [currentCartItems, setCurrentCartItems] = useState([...cart.items]);
    const [currentCart, setCurrentCart] = useState<CartState>(cart);
    const [placeOrderSuccess, setPlaceOrderSuccess] = useState<boolean>(false);
    const [orderNumber, setOrderNumber] = useState<string>("");
    const subTotal = currentCart.subTotal;
    const [orderTotal, setOrderTotal] = useState(subTotal);
    const navigate = useNavigate();
    const [orderPlaced, setOrderPlaced] = useState<boolean>(false);
    const [canProceedFromShipping, setCanProceedFromShipping] =
        useState<boolean>(false);
    const [canProceedFromPayment, setCanProceedFromPayment] =
        useState<boolean>(false);
    const [canPlaceOrder, setCanPlaceOrder] = useState<boolean>(false);
    const [nextDisabled, setNextDisabled] = useState<boolean>(false);
    const { timeLeft } = useCheckoutTimer();
    const [showRenewDialogue, setShowRenewDialogue] = useState<boolean>(false);
    const [dismissedRenewDialogue, setDismissedRenewDialogue] =
        useState<boolean>(false);
    const [cartEdited, setCartEdited] = useState<boolean>(false);

    // Hold stock till checkout is complete or user navigates away from page.
    useEffect(() => {
        // Function to hold stock when the component mounts
        const holdStock = async () => {
            if (cart.cartId) {
                dispatch(syncCart());
                setCurrentCartItems([...cart.items]);
            }
            try {
                dispatch(holdCartStock());
            } catch (error) {
                if (error instanceof AxiosError) {
                    console.error("Error holding stock", error);
                } else {
                    console.error(
                        "An unknown error has occurred while placing hold on stock"
                    );
                }
            }
        };

        // Hold stock when component mounts
        holdStock();
    }, []);

    useEffect(() => {
        if (cart.cartChangesMade) {
            setCartEdited(true);
            dispatch(setCartChangesMade(false));
        }
    }, [cart.cartChangesMade]);

    useEffect(() => {
        let canProceed = true;
        for (const key of Object.keys(shippingDetails)) {
            if (
                key !== "shippingAddress2" &&
                shippingDetails[key as keyof ShippingDetails] === ""
            ) {
                canProceed = false;
                break;
            } else if (
                key === "stateAbbr" &&
                !validStates.includes(shippingDetails[key])
            ) {
                canProceed = false;
                break;
            }
        }
        setCanProceedFromPayment(canProceed);
    }, [shippingDetails]);

    useEffect(() => {
        let canProceed = true;
        if (
            paymentDetails.cardHolder === "" ||
            paymentDetails.expiryDate === ""
        ) {
            canProceed = false;
        }
        setCanProceedFromShipping(canProceed);
    }, [paymentDetails]);

    useEffect(() => {
        let canProceed = true;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (email === "" || !emailRegex.test(email)) {
            canProceed = false;
        }

        setCanPlaceOrder(canProceed);
    }, [email]);

    useEffect(() => {
        switch (activeStep) {
            case 0:
                if (canProceedFromPayment) {
                    setNextDisabled(false);
                } else {
                    setNextDisabled(true);
                }
                break;
            case 1:
                if (canProceedFromShipping) {
                    setNextDisabled(false);
                } else {
                    setNextDisabled(true);
                }
                break;
            case 2:
                if (canPlaceOrder) {
                    setNextDisabled(false);
                } else {
                    setNextDisabled(true);
                }
                break;
            default:
                setNextDisabled(false);
                break;
        }
    }, [
        activeStep,
        canProceedFromPayment,
        canProceedFromShipping,
        canPlaceOrder,
    ]);

    const getStepContent = (step: number) => {
        switch (step) {
            case 0:
                return (
                    <AddressForm
                        setShippingDetails={setShippingDetails}
                        shippingDetails={shippingDetails}
                    />
                );
            case 1:
                return (
                    <PaymentForm
                        setPaymentDetails={setPaymentDetails}
                        paymentDetails={paymentDetails}
                    />
                );
            case 2:
                return (
                    <Review
                        cart={currentCart}
                        taxRate={taxRate}
                        shipping={shippingRate}
                        total={orderTotal}
                        paymentDetails={paymentDetails}
                        shippingDetails={shippingDetails}
                        email={email}
                        setEmail={setEmail}
                    />
                );
            default:
                throw new Error("Unknown step");
        }
    };

    const handleNext = async () => {
        if (activeStep === 2) {
            const orderNo = await handlePlaceOrder();
            if (orderNo) {
                setOrderNumber(orderNo);
                setPlaceOrderSuccess(true);
                setActiveStep(activeStep + 1);
            } else {
                setActiveStep(activeStep + 1);
            }
        } else {
            if (activeStep === 0) {
                updateTotal();
            }
            if (activeStep === 1) {
                dispatch(syncCart());
                setCurrentCartItems([...cart.items]);
            }
            setActiveStep(activeStep + 1);
        }
    };

    useEffect(() => {
        setCurrentCartItems([...cart.items]);
    }, [cart.items]);

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    const handlePlaceOrder = async () => {
        const orderData: OrderData = {
            cartId: cart.cartId,
            shipping: shippingDetails,
            email: email,
            orderDetails: {
                subTotal: Number(currentCart.subTotal),
                shipping: Number(shippingRate),
                tax:
                    (Number(currentCart.subTotal) + Number(shippingRate)) *
                    Number(taxRate),
                totalAmount: Number(orderTotal),
                items: currentCartItems.map((item) => {
                    const returnItem = {
                        productNo: item.productNo,
                        quantity: Number(item.quantity),
                        priceAtCheckout: item.discountPrice
                            ? Number(item.discountPrice)
                            : Number(item.price),
                    };
                    return returnItem;
                }),
            },
        };
        const token = localStorage.getItem("jwtToken");

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/order/create`,
                orderData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            if (response.data.orderNo) {
                setOrderPlaced(true);

                dispatch(
                    logActivity({
                        activityType: "purchase",
                        productNo: orderData.orderDetails.items.map(
                            (item) => item.productNo
                        ),
                    })
                );
                dispatch(pushActivityLogs());
                dispatch(clearCart());
                return response.data.orderNo;
            } else {
                throw new Error("no orderNo returned");
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error("Error placing order", error);
            } else {
                console.error(
                    "An unknown error has occurred while placing order"
                );
            }
        }
    };

    const updateTotal = () => {
        console.log(
            Number(subTotal) +
                Number(shippingRate) +
                (Number(subTotal) + Number(shippingRate)) * Number(taxRate)
        );
        setOrderTotal(
            Number(subTotal) +
                Number(shippingRate) +
                (Number(subTotal) + Number(shippingRate)) * Number(taxRate)
        );
    };

    useEffect(() => {
        if (timeLeft) {
            if (timeLeft.minutes === 0 && timeLeft.seconds === 0) {
                navigate("/shoppingcart");
            } else if (
                timeLeft.minutes === 0 &&
                timeLeft.seconds < 16 &&
                !dismissedRenewDialogue
            ) {
                setShowRenewDialogue(true);
            }
        }
    }, [timeLeft]);

    const handleExtendSession = async () => {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/inventory/extendHold`,
                { cartId: currentCartId }
            );
            dispatch(setExpirationTime({ expiration: response.data.payload }));
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error("Error extending hold", error);
            } else {
                console.error(
                    "An unknown error has ocurred while extending hold on stock"
                );
            }
        } finally {
            setShowRenewDialogue(false);
            setDismissedRenewDialogue(false);
        }
    };

    return (
        // <ThemeProvider theme={showCustomTheme ? checkoutTheme : defaultTheme}>
        <React.Fragment>
            <CssBaseline />
            <Grid
                container
                sx={{ height: { xs: "100%" }, minHeight: { sm: "80vh" } }}
            >
                <Grid
                    sx={{
                        display: { xs: "none", md: "flex" },
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
                                One or more items in your cart was unavailable
                                or had limited availability. Quantities have
                                been adjusted.
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
                        <Info
                            totalPrice={orderTotal}
                            items={currentCartItems}
                        />
                    </Box>
                </Grid>
                <Grid
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        maxWidth: "100%",
                        width: "100%",
                        backgroundColor: {
                            xs: "transparent",
                            sm: "background.default",
                        },
                        alignItems: "start",
                        pt: { xs: 2, sm: 4 },
                        px: { xs: 2, sm: 10 },
                        gap: { xs: 4, md: 8 },
                    }}
                    size={{
                        sm: 12,
                        md: 7,
                        lg: 8,
                    }}
                >
                    <Box
                        sx={{
                            width: "100%",
                            maxWidth: { sm: "100%", md: 600 },
                        }}
                    >
                        <Box
                            sx={{
                                display: { xs: "flex", md: "none" },
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
                                        {String(timeLeft.seconds).padStart(
                                            2,
                                            "0"
                                        )}
                                    </Typography>
                                </Box>
                            )}
                        </Box>
                        {cartEdited && (
                            <Box
                                sx={{
                                    backgroundColor: "var(--peaches-and-cream)",
                                    padding: "5px",
                                    marginTop: "10px",
                                }}
                            >
                                <Typography color="info">
                                    One or more items in your cart was
                                    unavailable or had limited availability.
                                    Quantities have been adjusted.
                                </Typography>
                            </Box>
                        )}

                        <Box
                            sx={{
                                display: { xs: "none", md: "flex" },
                                flexDirection: "column",
                                justifyContent: "space-between",
                                alignItems: "flex-end",
                                flexGrow: 1,
                                height: 60,
                            }}
                        >
                            <Stepper
                                id="desktop-stepper"
                                activeStep={activeStep}
                                sx={{
                                    width: "100%",
                                    height: 40,
                                }}
                            >
                                {steps.map((label) => (
                                    <Step
                                        sx={{
                                            ":first-of-type": { pl: 0 },
                                            ":last-of-type": { pr: 0 },
                                        }}
                                        key={label}
                                    >
                                        <StepLabel>{label}</StepLabel>
                                    </Step>
                                ))}
                            </Stepper>
                        </Box>
                    </Box>
                    <Card
                        sx={{
                            display: { xs: "flex", md: "none" },
                            width: "100%",
                        }}
                    >
                        <CardContent
                            sx={{
                                display: "flex",
                                width: "100%",
                                alignItems: "center",
                                justifyContent: "space-between",
                                ":last-child": { pb: 2 },
                            }}
                        >
                            <div>
                                <Typography variant="subtitle2" gutterBottom>
                                    Selected products
                                </Typography>
                                <Typography variant="body1">
                                    {`$${Number(orderTotal).toFixed(2)}`}
                                </Typography>
                            </div>
                            <InfoMobile
                                totalPrice={orderTotal}
                                items={currentCartItems}
                            />
                        </CardContent>
                    </Card>
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            flexGrow: 1,
                            width: "100%",
                            maxWidth: { sm: "100%", md: 600 },
                            gap: { xs: 5, md: "none" },
                        }}
                    >
                        <Stepper
                            id="mobile-stepper"
                            activeStep={activeStep}
                            alternativeLabel
                            sx={{ display: { sm: "flex", md: "none" } }}
                        >
                            {steps.map((label) => (
                                <Step
                                    sx={{
                                        ":first-of-type": { pl: 0 },
                                        ":last-of-type": { pr: 0 },
                                        "& .MuiStepConnector-root": {
                                            top: { xs: 6, sm: 12 },
                                        },
                                    }}
                                    key={label}
                                >
                                    <StepLabel
                                        sx={{
                                            ".MuiStepLabel-labelContainer": {
                                                maxWidth: "70px",
                                            },
                                        }}
                                    >
                                        {label}
                                    </StepLabel>
                                </Step>
                            ))}
                        </Stepper>
                        <Typography sx={{ fontSize: ".8rem" }}>
                            Note: This is not a real e-store. None of the
                            products are real, and the site will not accept real
                            payment details or process payments. Submitted names
                            and addresses will be accessible via the admin demo
                            site, however, so do not input any real names, phone
                            numbers, street addresses, or email addresses that
                            you wish not to be made publicly visible.
                        </Typography>

                        {/* Main content */}
                        {activeStep === steps.length ? (
                            placeOrderSuccess === true ? (
                                <Stack spacing={2} useFlexGap>
                                    <Typography variant="h1">📦</Typography>
                                    <Typography variant="h5">
                                        Thank you for your order!
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                    >
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
                                        >
                                            Go to my orders
                                        </Button>
                                    )}
                                </Stack>
                            ) : (
                                <Stack spacing={2} useFlexGap>
                                    <Typography variant="h5">Oops!</Typography>
                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                    >
                                        Something went wrong when placing your
                                        order. Please try again.
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            alignSelf: "start",
                                            width: { xs: "100%", sm: "auto" },
                                        }}
                                        onClick={() =>
                                            navigate("/shoppingcart")
                                        }
                                    >
                                        Back to Cart
                                    </Button>
                                </Stack>
                            )
                        ) : (
                            <React.Fragment>
                                {getStepContent(activeStep)}
                                <Box
                                    sx={{
                                        display: "flex",
                                        flexDirection: {
                                            xs: "column-reverse",
                                            sm: "row",
                                        },
                                        justifyContent:
                                            activeStep !== 0
                                                ? "space-between"
                                                : "flex-end",
                                        alignItems: "end",
                                        flexGrow: 1,
                                        gap: 1,
                                        pb: { xs: 6, sm: 0 },
                                        mt: { xs: 2, sm: 0 },
                                        mb: { xs: 0, md: "60px" },
                                    }}
                                >
                                    {activeStep !== 0 && (
                                        <Button
                                            startIcon={
                                                <ChevronLeftRoundedIcon />
                                            }
                                            onClick={handleBack}
                                            variant="text"
                                            sx={{
                                                display: {
                                                    xs: "none",
                                                    sm: "flex",
                                                },
                                            }}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    {activeStep !== 0 && (
                                        <Button
                                            startIcon={
                                                <ChevronLeftRoundedIcon />
                                            }
                                            onClick={handleBack}
                                            variant="outlined"
                                            fullWidth
                                            sx={{
                                                display: {
                                                    xs: "flex",
                                                    sm: "none",
                                                },
                                            }}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    <Button
                                        variant="contained"
                                        endIcon={<ChevronRightRoundedIcon />}
                                        onClick={handleNext}
                                        sx={{
                                            width: {
                                                xs: "100%",
                                                sm: "fit-content",
                                            },
                                        }}
                                        disabled={nextDisabled}
                                    >
                                        {activeStep === steps.length - 1
                                            ? "Place order"
                                            : "Next"}
                                    </Button>
                                </Box>
                            </React.Fragment>
                        )}
                    </Box>
                </Grid>
            </Grid>
            {timeLeft && showRenewDialogue && (
                <BlankPopup>
                    <div>
                        Checkout will expire in {timeLeft.seconds}s. Extend
                        session?
                    </div>
                    <div className="extend-btns">
                        <Button
                            variant="contained"
                            onClick={handleExtendSession}
                        >
                            Yes
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setDismissedRenewDialogue(true);
                                setShowRenewDialogue(false);
                            }}
                        >
                            No
                        </Button>
                    </div>
                </BlankPopup>
            )}
        </React.Fragment>
    );
};

export default Checkout;
