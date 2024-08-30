import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
// import "./style/general.css";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../common/utils/materialUITheme";
import Nav from "./components/Nav/Nav";
import About from "./components/About/About";
import Login from "./components/LogIn/Login";
import Signup from "./components/SignUp/Signup";
import Home from "./components/Home/Home";
import ProductDetails from "./components/ProductDetails/ProductDetails";
import OrderStatus from "./components/OrderStatus/OrderStatus";
import Sustainability from "./components/Sustainability/Sustainability";
import Footer from "./components/Footer/Footer";
import TermsAndConditions from "./components/TermsAndConditions/TermsAndConditions";
import ShippingAndReturns from "./components/ShippingAndReturns/ShippingAndReturns";
import PrivacyAndCookies from "./components/PrivacyAndCookies/PrivacyAndCookies";
import Shop from "./components/Shop/Shop";
import { useAppDispatch } from "./hooks/reduxHooks";
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

const CustomerApp: React.FC = () => {
    const dispatch = useAppDispatch();
    useEffect(() => {
        dispatch(fetchCategories());
        dispatch(fetchSearchOptions());
    }, [dispatch]);

    const { width, pixelDensity } = useWindowSizeContext();

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
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/order-status" element={<OrderStatus />} />
                        <Route path="/shoppingcart" element={<Cart />} />
                        <Route path="/checkout" element={<Checkout />} />
                        <Route path="/product" element={<ProductDetails />} />
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
                <Footer />
            </div>
        </ThemeProvider>
    );
};

export default CustomerApp;
