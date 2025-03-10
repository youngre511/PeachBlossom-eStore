/// <reference types="vite-plugin-svgr/client" />
import React, {
    ChangeEvent,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import "./nav.css";

// States, Contexts and Thunks
import { RootState } from "../../store/customerStore";
import { AuthContext } from "../../../common/contexts/authContext";
import { logActivity } from "../../store/userData/userDataTrackingThunks";

// Hooks
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useNavigate, useLocation } from "react-router-dom";
import { useNavigationContext } from "../../../common/contexts/navContext";

// Components
import AccountsTab from "../AccountsTab/AccountsTab";
import CartDropDown from "../Cart/CartDropDown";
import RecentlyViewed from "./components/RecentlyViewed";
import ShopNav from "./components/ShopNav";
import { Autocomplete, Button, TextField } from "@mui/material";

//logo imports
import pblogo1x from "../../../assets/peachblossomlogo-1x.webp";
import pblogo2x from "../../../assets/peachblossomlogo-2x.webp";
import pblogo3x from "../../../assets/peachblossomlogo-3x.webp";

// button icons
import AccountButton from "../../../assets/img/account.svg?react";
import CartButton from "../../../assets/img/cart.svg?react";
import RecentButton from "../../../assets/img/recent.svg?react";
import SearchButton from "../../../assets/img/search.svg?react";
import ProductSearchField from "./components/ProductSearchField";

interface Props {}
const Nav: React.FC<Props> = () => {
    // Global States
    const cart = useAppSelector((state: RootState) => state.cart);
    const cartContents = cart.numberOfItems;
    const searchOptionsSlice = useAppSelector(
        (state: RootState) => state.searchOptions
    );

    // Refs
    const header = useRef<HTMLElement>(null);
    const shopAnimationRef = useRef<GSAPTimeline | null>(null);

    // Hook invocations
    const auth = useContext(AuthContext);
    const dispatch = useAppDispatch();
    const location = useLocation();
    const loggedIn = auth && auth.user && !auth.isTokenExpired();
    const navigate = useNavigate();
    const { contextSafe } = useGSAP({ scope: header });
    const { currentRoute, previousRoute } = useNavigationContext();

    // Local States
    const [accountsTabVisible, setAccountsTabVisible] =
        useState<boolean>(false);
    const [isCartDropdownVisible, setCartDropdownVisible] =
        useState<boolean>(false);
    const [isRecentVisible, setRecentVisible] = useState<boolean>(false);
    const [isSearchBarVisible, setIsSearchBarVisible] =
        useState<boolean>(false);
    const [isShopMenuVisible, setShopMenuVisible] = useState<boolean>(false);
    const [searchOptions, setSearchOptions] = useState<Array<string>>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");
    const cartAnimationRef = useRef<GSAPTimeline | null>(null);
    const recentAnimationRef = useRef<GSAPTimeline | null>(null);

    useEffect(() => {
        if (searchOptionsSlice.searchOptions) {
            setSearchOptions(searchOptionsSlice.searchOptions);
        }
    }, [searchOptionsSlice]);

    useEffect(
        contextSafe(() => {
            // Shop dropdown animation
            shopAnimationRef.current = gsap
                .timeline({ paused: true })
                .to(".shop-nav", {
                    duration: 0.3,
                    opacity: 1,
                    scale: 1,
                    ease: "power1.inOut",
                });
            // The animation is played in reverse for hiding

            // Ensure the menu is hidden initially
            gsap.set(".shop-nav", { display: "none", opacity: 0 });

            // Cart dropdown animation
            cartAnimationRef.current = gsap
                .timeline({ paused: true })
                .to(".drop-cart", {
                    duration: 0.3,
                    opacity: 1,
                    scale: 1,
                    ease: "power1.inOut",
                });
            // The animation is played in reverse for hiding

            // Ensure the menu is hidden initially
            gsap.set(".drop-cart", { display: "none", opacity: 0 });

            // Recent items dropdown animation
            recentAnimationRef.current = gsap
                .timeline({ paused: true })
                .to(".recent-items", {
                    duration: 0.3,
                    opacity: 1,
                    scale: 1,
                    ease: "power1.inOut",
                });
            // The animation is played in reverse for hiding

            // Ensure the menu is hidden initially
            gsap.set(".recent-items", { display: "none", opacity: 0 });
        }),
        []
    );

    useEffect(
        contextSafe(() => {
            if (isSearchBarVisible) {
                gsap.timeline()
                    .set(".search-tab", { display: "block" })
                    .to(".search-tab", {
                        duration: 0.4,
                        right: 0,
                        ease: "power1.inOut",
                    });
            } else {
                gsap.timeline()
                    .to(".search-tab", {
                        right: "-50vw",
                        ease: "power1.inOut",
                        duration: 0.4,
                    })
                    .set(".search-tab", { display: "none" });
            }
        }),
        [isSearchBarVisible]
    );

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const path = `/shop?sort=name-ascend&page=1&search=${searchQuery.replaceAll(
            " ",
            "%20"
        )}`;
        dispatch(
            logActivity({ activityType: "search", searchTerm: searchQuery })
        );
        navigate(path);
        setSearchQuery("");
    };

    const handleShopMouseEnter = () => {
        if (shopAnimationRef.current) {
            // Play the animation forward
            gsap.set(".shop-nav", { display: "block" });
            shopAnimationRef.current.play();
        }
        setShopMenuVisible(true);
    };

    const handleShopMouseLeave = () => {
        if (shopAnimationRef.current) {
            // Reverse the animation (hide the menu)
            shopAnimationRef.current.reverse().then(() => {
                if (!isShopMenuVisible) {
                    gsap.set(".shop-nav", { display: "none" });
                }
            });
        }
        setShopMenuVisible(false);
    };

    const handleCartMouseEnter = () => {
        if (
            cartContents > 0 &&
            location.pathname !== "/shoppingcart" &&
            location.pathname !== "/checkout"
        ) {
            if (cartAnimationRef.current) {
                // Play the animation forward
                gsap.set(".drop-cart", { display: "block" });
                cartAnimationRef.current.play();
            }
            setCartDropdownVisible(true);
        }
    };

    const handleCartMouseLeave = () => {
        if (cartAnimationRef.current) {
            // Reverse the animation (hide the cart)
            cartAnimationRef.current.reverse().then(() => {
                if (!isCartDropdownVisible) {
                    gsap.set(".drop-cart", { display: "none" });
                }
            });
        }
        setCartDropdownVisible(false);
    };

    const handleRecentMouseEnter = () => {
        if (recentAnimationRef.current) {
            // Play the animation forward
            gsap.set(".recent-items", { display: "flex" });
            recentAnimationRef.current.play();
        }
        setRecentVisible(true);
    };

    const handleRecentMouseLeave = () => {
        if (recentAnimationRef.current) {
            // Reverse the animation (hide the cart)
            recentAnimationRef.current.reverse().then(() => {
                if (!isRecentVisible) {
                    gsap.set(".recent-items", { display: "none" });
                }
            });
        }
        setRecentVisible(false);
    };

    useEffect(() => {
        if (currentRoute) {
            if (
                currentRoute === "/shoppingcart" ||
                currentRoute === "/checkout"
            ) {
                handleCartMouseLeave();
                setCartDropdownVisible(false);
            }
            if (
                currentRoute.startsWith("/shop") &&
                !currentRoute.includes("cart")
            ) {
                if (previousRoute) {
                    if (
                        !previousRoute.startsWith("/shop") ||
                        (previousRoute.startsWith("/shop") &&
                            !previousRoute.includes("cart"))
                    ) {
                        setIsSearchBarVisible(true);
                    }
                } else {
                    setIsSearchBarVisible(true);
                }
            } else {
                setIsSearchBarVisible(false);
            }
        }
    }, [currentRoute, previousRoute]);

    return (
        <header ref={header}>
            <div className="blur-filter"></div>
            <div className="nav-bar">
                {/* Main Nav */}
                <ul className="left-menu">
                    <li
                        className="nav-text"
                        onMouseEnter={() => handleShopMouseEnter()}
                        onMouseLeave={() => handleShopMouseLeave()}
                        onClick={() => {
                            setShopMenuVisible(false);
                            navigate("/shop");
                        }}
                        role="button"
                    >
                        Shop
                    </li>
                    <li
                        className="nav-text"
                        role="button"
                        onClick={() => navigate("/about")}
                    >
                        About
                    </li>
                    <li
                        className="nav-text"
                        role="button"
                        onClick={() => navigate("/sustainability")}
                    >
                        Sustainability
                    </li>
                </ul>
                {/* SVG serves double duty as logo placeholder and clip-path-template for search tab */}
                <svg width="160px" height="0">
                    <defs>
                        <clipPath id="complex-left-clip">
                            <path
                                transform="scale(0.39)"
                                d="M799.4-.3v74.3c0,66.3.7-86.9,0,86.4h-489.6c-180,0-160.8-160.8-280.8-160.8h770.4"
                            />
                        </clipPath>
                    </defs>
                </svg>
                <ul className="right-menu">
                    <li
                        className="nav-text"
                        role="button"
                        onClick={() => {
                            if (loggedIn) {
                                navigate("/orders");
                            } else {
                                navigate("/order-status");
                            }
                        }}
                    >
                        Orders
                    </li>
                    <li
                        className="nav-text"
                        role="button"
                        onClick={() => navigate("/support")}
                    >
                        Support
                    </li>
                    <li>
                        <div
                            className="nav-icon"
                            id="search"
                            aria-label="search"
                            tabIndex={0}
                            role="button"
                            onClick={() =>
                                setIsSearchBarVisible(!isSearchBarVisible)
                            }
                        >
                            <SearchButton />
                        </div>
                    </li>
                    <li>
                        <div
                            className="nav-icon"
                            id="account"
                            aria-label="account"
                            tabIndex={0}
                            role="button"
                            onClick={() =>
                                setAccountsTabVisible(!accountsTabVisible)
                            }
                        >
                            <AccountButton />
                        </div>
                    </li>
                    <li
                        onMouseEnter={handleRecentMouseEnter}
                        onMouseLeave={handleRecentMouseLeave}
                    >
                        <div
                            className="nav-icon"
                            id="recents"
                            aria-label="recently viewed"
                            tabIndex={0}
                            role="button"
                        >
                            <RecentButton />
                        </div>
                    </li>
                    <li
                        onMouseEnter={() => handleCartMouseEnter()}
                        onMouseLeave={() => handleCartMouseLeave()}
                    >
                        <div
                            className="nav-icon"
                            id="cart"
                            aria-label="cart"
                            tabIndex={0}
                            role="button"
                            onClick={() => navigate("/shoppingcart")}
                        >
                            <CartButton />
                            {cartContents > 0 && (
                                <div
                                    className="cart-badge"
                                    aria-live="polite"
                                    onClick={() => navigate("/shoppingcart")}
                                >
                                    <div className="badge-background"></div>
                                    <div className="badge-background-overlay"></div>
                                    <p
                                        id="cart-contents"
                                        aria-label={`Cart with ${cartContents} items`}
                                    >
                                        {cartContents}
                                    </p>
                                </div>
                            )}
                        </div>
                    </li>
                </ul>
                {/* Floats */}
                <div className="search-tab">
                    <div className="search-input">
                        <ProductSearchField
                            handleSearch={handleSearch}
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            searchOptions={searchOptions}
                        />
                    </div>
                </div>
                <div className="nav-logo">
                    <div className="border-under"></div>
                    <div className="border-over"></div>
                    <img
                        src={pblogo3x}
                        srcSet={`${pblogo1x} 1x, ${pblogo2x} 2x, ${pblogo3x} 3x`}
                        alt="peach blossom logo"
                        width="158px"
                        height="158px"
                    />
                    <div
                        className="logo-clickable"
                        onClick={() => navigate("/")}
                    ></div>
                </div>
                <RecentlyViewed
                    isRecentVisible={isRecentVisible}
                    handleRecentMouseEnter={handleRecentMouseEnter}
                    handleRecentMouseLeave={handleRecentMouseLeave}
                />
                <ShopNav
                    isShopMenuVisible={isShopMenuVisible}
                    handleShopMouseEnter={handleShopMouseEnter}
                    handleShopMouseLeave={handleShopMouseLeave}
                />
                <CartDropDown
                    isCartDropdownVisible={isCartDropdownVisible}
                    handleCartMouseEnter={handleCartMouseEnter}
                    handleCartMouseLeave={handleCartMouseLeave}
                />
            </div>
            <AccountsTab
                setAccountsTabVisible={setAccountsTabVisible}
                accountsTabVisible={accountsTabVisible}
            />
        </header>
    );
};
export default Nav;
