import React, { useState, useContext } from "react";

// MUI Components
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Grid from "@mui/material/Grid2";
import Typography from "@mui/material/Typography";

// Hooks and Contexts
import useCheckoutCartUpdates from "./hooks/useCheckoutCartUpdates";
import useCheckoutInitialization from "./hooks/useCheckoutInitialization";
import useCheckoutTimerRedirect from "./hooks/useCheckoutTimerRedirect";
import { AuthContext } from "../../../common/contexts/authContext";
import { useAppSelector, useAppDispatch } from "../../hooks/reduxHooks";
import { useCheckoutTimer } from "../../../common/contexts/checkoutTimerContext";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

// States and Thunks
import { RootState } from "../../store/customerStore";
import { syncCart, clearCart } from "../../features/Cart/cartSlice";
import {
    logActivity,
    pushActivityLogs,
} from "../../store/userData/userDataTrackingThunks";

// Types
import { CartState } from "../../features/Cart/CartTypes";
import { OrderData, PaymentDetails } from "./checkoutTypes";
import { ShippingDetails } from "../../store/userData/UserDataTypes";

// Components
import CheckoutContent from "./components/CheckoutContent";
import CheckoutNavButtons from "./components/CheckoutNavButtons";
import DesktopSidebar from "./components/DesktopComponents/DesktopSidebar";
import DesktopStepper from "./components/DesktopComponents/DesktopStepper";
import MobileHeader from "./components/MobileComponents/MobileHeader";
import MobileStepper from "./components/MobileComponents/MobileStepper";
import MobileTopBar from "./components/MobileComponents/MobileTopBar";
import OrderResult from "./components/OrderResult";
import RenewDialog from "./components/RenewDialog";

import axios, { AxiosError } from "axios";
import "./checkout.css";
import { logAxiosError } from "../../../common/utils/logAxiosError";

const steps = ["Shipping address", "Payment details", "Review your order"];

const Checkout: React.FC = () => {
    const dispatch = useAppDispatch();
    const auth = useContext(AuthContext);
    const loggedIn = auth && auth.user && !auth.isTokenExpired();
    const cart = useAppSelector((state: RootState) => state.cart);
    const subTotal = cart.subTotal;
    const cartId = cart.cartId;
    const { width } = useWindowSizeContext();
    const { timeLeft } = useCheckoutTimer();

    // States
    const [activeStep, setActiveStep] = useState(0);
    const [addNew, setAddNew] = useState<boolean>(false);
    const [canProceed, setCanProceed] = useState<boolean>(false);
    const [cartEdited, setCartEdited] = useState<boolean>(false);
    const [currentCartItems, setCurrentCartItems] = useState([...cart.items]);
    const [dismissedRenewDialog, setDismissedRenewDialog] =
        useState<boolean>(false);
    const [email, setEmail] = useState<string>("");
    const [orderNumber, setOrderNumber] = useState<string>("");
    const [orderPlaced, setOrderPlaced] = useState<boolean>(false);
    const [orderTotal, setOrderTotal] = useState(subTotal);
    const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
        cardType: "Visa",
        cardHolder: "",
        cardNumber: "1234 5678 9012 3456",
        cvv: "123",
        expiryDate: "",
    });
    const [placeOrderSuccess, setPlaceOrderSuccess] = useState<boolean>(false);
    const [saveAddress, setSaveAddress] = useState<boolean>(true);
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
    const [showRenewDialog, setShowRenewDialog] = useState<boolean>(false);

    // Constants
    const shippingRate = 9.99;
    const taxRate = 0.06;

    useCheckoutInitialization({ cart, setCurrentCartItems });
    useCheckoutTimerRedirect({ dismissedRenewDialog, setShowRenewDialog });
    useCheckoutCartUpdates({ cart, setCartEdited, setCurrentCartItems });

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

    const handleBack = () => {
        setActiveStep(activeStep - 1);
    };

    const updateTotal = () => {
        setOrderTotal(
            Number(subTotal) +
                Number(shippingRate) +
                (Number(subTotal) + Number(shippingRate)) * Number(taxRate)
        );
    };

    const handlePlaceOrder = async () => {
        const orderData: OrderData = {
            cartId: cart.cartId,
            shipping: shippingDetails,
            email: email,
            orderDetails: {
                subTotal: Number(subTotal),
                shipping: Number(shippingRate),
                tax:
                    (Number(subTotal) + Number(shippingRate)) * Number(taxRate),
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
                { orderData, save: saveAddress },
                {
                    headers: {
                        "Content-Type": "application/json",
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
            logAxiosError(error, "placing order");
        }
    };

    return (
        <React.Fragment>
            <CssBaseline />
            <Grid
                container
                sx={{ height: { xs: "100%" }, minHeight: { sm: "80vh" } }}
            >
                {!width ||
                    (width >= 900 && (
                        <DesktopSidebar
                            activeStep={activeStep}
                            steps={steps}
                            orderTotal={orderTotal}
                            currentCartItems={currentCartItems}
                            cartEdited={cartEdited}
                        />
                    ))}
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
                        {width && width < 900 && (
                            <React.Fragment>
                                <MobileHeader />
                                <MobileTopBar
                                    orderTotal={orderTotal}
                                    items={currentCartItems}
                                />
                            </React.Fragment>
                        )}
                        {!width ||
                            (width >= 900 && (
                                <DesktopStepper
                                    activeStep={activeStep}
                                    steps={steps}
                                />
                            ))}
                    </Box>
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
                        {width! < 900 && (
                            <MobileStepper
                                activeStep={activeStep}
                                steps={steps}
                            />
                        )}
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
                            <OrderResult
                                placeOrderSuccess={placeOrderSuccess}
                                orderNumber={orderNumber}
                            />
                        ) : (
                            <React.Fragment>
                                <CheckoutContent
                                    step={activeStep}
                                    setCanProceed={setCanProceed}
                                    shippingDetails={shippingDetails}
                                    setShippingDetails={setShippingDetails}
                                    paymentDetails={paymentDetails}
                                    setPaymentDetails={setPaymentDetails}
                                    addNew={addNew}
                                    setAddNew={setAddNew}
                                    email={email}
                                    setEmail={setEmail}
                                    loggedIn={loggedIn}
                                    cart={cart}
                                    taxRate={taxRate}
                                    shippingRate={shippingRate}
                                    orderTotal={orderTotal}
                                />
                                <CheckoutNavButtons
                                    activeStep={activeStep}
                                    numberOfSteps={steps.length - 1}
                                    loggedIn={loggedIn}
                                    addNew={addNew}
                                    handleBack={handleBack}
                                    handleNext={handleNext}
                                    nextDisabled={!canProceed}
                                    saveAddress={saveAddress}
                                    setSaveAddress={setSaveAddress}
                                />
                            </React.Fragment>
                        )}
                    </Box>
                </Grid>
            </Grid>
            {timeLeft && showRenewDialog && (
                <RenewDialog
                    cartId={cartId!}
                    setShowRenewDialog={setShowRenewDialog}
                    setDismissedRenewDialog={setDismissedRenewDialog}
                />
            )}
        </React.Fragment>
    );
};

export default Checkout;
