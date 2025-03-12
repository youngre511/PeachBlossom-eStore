import React, { useEffect, useRef, useState } from "react";
import "./nav.css";

// Types
import { RootState } from "../../store/customerStore";

// Hooks
import { useAppSelector } from "../../hooks/reduxHooks";
import gsap from "gsap";
import { useLocation } from "react-router-dom";
import { useNavigationContext } from "../../../common/contexts/navContext";
import useDesktopMenuAnimations from "./hooks/useDesktopMenuAnimations";

// Components
import AccountsTab from "../AccountsTab/AccountsTab";
import CartDropDown from "../Cart/CartDropDown";
import RecentlyViewed from "./components/RecentlyViewed";
import ShopNav from "./components/DesktopComponents/ShopNav";
import ProductSearchField from "./components/ProductSearchField";
import LeftMenu from "./components/DesktopComponents/LeftMenu";
import RightMenu from "./components/DesktopComponents/RightMenu";
import FullLogo from "./components/FullLogo";

interface Props {}
const Nav: React.FC<Props> = () => {
    // Global States
    const cart = useAppSelector((state: RootState) => state.cart);
    const cartContents = cart.numberOfItems;
    const searchOptionsSlice = useAppSelector(
        (state: RootState) => state.searchOptions
    );

    // Refs
    const headerRef = useRef<HTMLElement>(null);

    // Hook invocations
    const location = useLocation();
    const {
        isSearchBarVisible,
        setIsSearchBarVisible,
        cartAnimationRef,
        shopAnimationRef,
        recentAnimationRef,
    } = useDesktopMenuAnimations({ headerRef });

    const { currentRoute, previousRoute } = useNavigationContext();

    // Local States
    const [accountsTabVisible, setAccountsTabVisible] =
        useState<boolean>(false);
    const [isCartDropdownVisible, setCartDropdownVisible] =
        useState<boolean>(false);
    const [isRecentVisible, setRecentVisible] = useState<boolean>(false);
    const [isShopMenuVisible, setShopMenuVisible] = useState<boolean>(false);
    const [searchOptions, setSearchOptions] = useState<Array<string>>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");

    useEffect(() => {
        if (searchOptionsSlice.searchOptions) {
            setSearchOptions(searchOptionsSlice.searchOptions);
        }
    }, [searchOptionsSlice]);

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
        <header ref={headerRef}>
            <div className="blur-filter"></div>
            <div className="nav-bar">
                {/* Main Nav */}
                <LeftMenu
                    handleShopMouseEnter={handleShopMouseEnter}
                    handleShopMouseLeave={handleShopMouseLeave}
                    setShopMenuVisible={setShopMenuVisible}
                />
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
                <RightMenu
                    isSearchBarVisible={isSearchBarVisible}
                    setIsSearchBarVisible={setIsSearchBarVisible}
                    accountsTabVisible={accountsTabVisible}
                    setAccountsTabVisible={setAccountsTabVisible}
                    handleRecentMouseEnter={handleRecentMouseEnter}
                    handleRecentMouseLeave={handleRecentMouseLeave}
                    handleCartMouseEnter={handleCartMouseEnter}
                    handleCartMouseLeave={handleCartMouseLeave}
                    cartContents={cartContents}
                />
                {/* Floats */}
                <div className="search-tab">
                    <div className="search-input">
                        <ProductSearchField
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            searchOptions={searchOptions}
                        />
                    </div>
                </div>
                <FullLogo mobile={false} />
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
