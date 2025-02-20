import React, { useContext, useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
// import "./style/general.css";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../common/utils/materialUITheme";
import Nav from "./components/Nav/Nav";
import About from "./components/About/About";
import Home from "./components/Home/Home";
import ProductDetails from "./components/ProductDetails/ProductDetails";
import OrderStatus from "./components/OrderStatus/OrderStatus";
import Sustainability from "./components/Sustainability/Sustainability";
import Footer from "./components/Footer/Footer";
import TermsAndConditions from "./components/TermsAndConditions/TermsAndConditions";
import ShippingAndReturns from "./components/ShippingAndReturns/ShippingAndReturns";
import PrivacyAndCookies from "./components/PrivacyAndCookies/PrivacyAndCookies";
import Shop from "./components/Shop/Shop";
import { useAppDispatch, useAppSelector } from "./hooks/reduxHooks";
import { fetchCategories } from "./features/Categories/categoriesSlice";
import { fetchSearchOptions } from "./features/SearchOptions/searchOptionsSlice";
import Cart from "./features/Cart/Cart";
import Checkout from "./components/Checkout/Checkout";
import MobileNav from "./components/MobileNav/MobileNav";
import { useWindowSizeContext } from "../common/contexts/windowSizeContext";
import pblogo1x from "../assets/peachblossomlogo-1x.webp";
import pblogo2x from "../assets/peachblossomlogo-2x.webp";
import pblogo3x from "../assets/peachblossomlogo-3x.webp";
import pbtext1x from "../assets/peachblossomtext-1x.webp";
import pbtext2x from "../assets/peachblossomtext-2x.webp";
import pbtext3x from "../assets/peachblossomtext-3x.webp";
import { useNavigationContext } from "../common/contexts/navContext";
import Support from "./components/Support/Support";
import CustomerOrders from "./components/CustomerOrders/CustomerOrders";
import ProtectedRoute from "../common/components/ProtectedRoute/ProtectedRoute";
import { AuthContext } from "../common/contexts/authContext";
import {
    getCookie,
    renewConsentCookie,
    syncCookieConsent,
} from "./utils/cookieUtils";
import { setAllowTracking } from "./features/UserData/userDataSlice";
import { RootState } from "./store/customerStore";
import {
    startActivityLogPusher,
    syncRecentlyViewed,
} from "./features/UserData/userDataTrackingThunks";
import CookieConsent from "./components/CookieConsent/CookieConsent";
import { Fade, IconButton, Snackbar } from "@mui/material";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";

const CustomerApp: React.FC = () => {
    const dispatch = useAppDispatch();
    const auth = useContext(AuthContext);
    const loggedIn = auth && auth.user && !auth.isTokenExpired();
    const navigate = useNavigate();
    const allowTracking = useAppSelector(
        (state: RootState) => state.userData.preferences.allowTracking
    );
    const { currentRoute, previousRoute } = useNavigationContext();
    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchSearchOptions());
    }, [dispatch]);
    const [showConsentBanner, setShowConsentBanner] = useState<boolean>(false);
    const [showSyncAlert, setShowSyncAlert] = useState<boolean>(false);

    const { width, pixelDensity } = useWindowSizeContext();

    // Code to ensure that navigating to a new root path loads the new component with the window scrolled to the top of window.
    useEffect(() => {
        if (currentRoute && previousRoute) {
            const currentRouteRootPath = currentRoute.split("?")[0];
            const previousRouteRootPath = previousRoute.split("?")[0];
            if (currentRouteRootPath !== previousRouteRootPath) {
                window.scrollTo(0, 0);
            }
        }
    }, [currentRoute, previousRoute]);

    useEffect(() => {
        const img = new Image();
        const src =
            pixelDensity === 3
                ? pblogo3x
                : pixelDensity === 1
                ? pblogo1x
                : pblogo2x;
        img.src = src;

        const img2 = new Image();
        const src2 =
            pixelDensity === 3
                ? pbtext3x
                : pixelDensity === 1
                ? pbtext1x
                : pbtext2x;
        img2.src = src2;
    }, []);

    // Cookie logic
    useEffect(() => {
        dispatch(syncRecentlyViewed());

        const consent = getCookie("cookieConsent");
        if (!consent) {
            setShowConsentBanner(true);
        } else {
            renewConsentCookie(dispatch);
            const parsedCookie = JSON.parse(consent);
            dispatch(setAllowTracking(parsedCookie.allowAll));
        }
    }, []);

    useEffect(() => {
        if (allowTracking) {
            const clearIntervalFunc = dispatch(startActivityLogPusher());

            return () => {
                clearIntervalFunc();
            };
        }
    }, [allowTracking, dispatch]);

    /**
     * @description When status of loggedIn changes to true, dispatch a call to sync the recently viewed list with the back end and import user cookie preferences.
     */
    useEffect(() => {
        if (loggedIn) {
            dispatch(syncRecentlyViewed());
            syncConsent();
        }
    }, [loggedIn]);

    const syncConsent = async () => {
        const overridden = await syncCookieConsent(dispatch, auth);
        if (overridden) {
            setShowSyncAlert(true);
        }
    };

    const closeAlertAction = (
        <React.Fragment>
            <IconButton
                size="small"
                aria-label="close"
                color="inherit"
                onClick={() => setShowSyncAlert(false)}
            >
                <CloseSharpIcon fontSize="small" />
            </IconButton>
        </React.Fragment>
    );

    return (
        <ThemeProvider theme={theme}>
            <div className="App">
                {width && width < 810 ? <MobileNav /> : <Nav />}
                <main>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/shop" element={<Shop />} />
                        <Route
                            path="/shop/product/:productNo"
                            element={<ProductDetails />}
                        />
                        <Route path="/about" element={<About />} />
                        <Route path="/order-status" element={<OrderStatus />} />
                        <Route
                            path="/orders"
                            element={
                                <ProtectedRoute
                                    component={CustomerOrders}
                                    requiredRole="customer"
                                />
                            }
                        />
                        <Route path="/shoppingcart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/product" element={<ProductDetails />} />
                        <Route path="/support" element={<Support />} />
                        <Route
                            path="/sustainability"
                            element={<Sustainability />}
                        />
                        <Route path="/terms" element={<TermsAndConditions />} />
                        <Route
                            path="/shipping-returns"
                            element={<ShippingAndReturns />}
                        />
                        <Route
                            path="/privacy"
                            element={<PrivacyAndCookies />}
                        />
                    </Routes>
                </main>
                {showConsentBanner && (
                    <CookieConsent
                        setShowConsentBanner={setShowConsentBanner}
                    />
                )}
                <Snackbar
                    open={showSyncAlert}
                    onClose={() => setShowSyncAlert(false)}
                    autoHideDuration={7000}
                    TransitionComponent={Fade}
                    TransitionProps={{
                        timeout: { enter: 300, exit: 800 },
                    }}
                    message="We’ve applied your account's cookie preferences to this device to ensure you have a consistent experience. You can update your preferences at any time by selecting the Manage Cookies option in the footer at the bottom of the page."
                    action={closeAlertAction}
                    ContentProps={{
                        sx: {
                            backgroundColor: "rgba(243, 217, 200, 0.85)",
                            color: "black",
                        },
                    }}
                    sx={{ marginRight: { sm: "24px" }, bottom: { sm: "48px" } }}
                />
                <Footer setShowConsentBanner={setShowConsentBanner} />
            </div>
        </ThemeProvider>
    );
};

export default CustomerApp;
