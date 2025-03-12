/// <reference types="vite-plugin-svgr/client" />
import React, { useEffect, useRef, useState } from "react";
import "./mobile-nav.css";

// Types
import { RootState } from "../../store/customerStore";

// Hooks
import { useAppSelector } from "../../hooks/reduxHooks";
import { useNavigationContext } from "../../../common/contexts/navContext";
import useMobileLogoAnimation from "./hooks/useMobileLogoAnimation";
import useMobileMenuAnimation from "./hooks/useMobileMenuAnimation";

// Components
import AccountsTab from "../AccountsTab/AccountsTab";
import ProductSearchField from "./components/ProductSearchField";
import FullLogo from "./components/FullLogo";
import TextLogo from "./components/TextLogo";
import LeftMobileMenu from "./components/MobileComponents/LeftMobileMenu";
import RightMobileMenu from "./components/MobileComponents/RightMobileMenu";
import MobileMenuDrawer from "./components/MobileComponents/MenuDrawer/MobileMenuDrawer";

const MobileNav: React.FC = () => {
    // Global States
    const cart = useAppSelector((state: RootState) => state.cart);
    const cartContents = cart.numberOfItems;
    const categories = useAppSelector(
        (state: RootState) => state.categories.categories
    );
    const searchOptionsSlice = useAppSelector(
        (state: RootState) => state.searchOptions
    );

    // Local States
    const [accountsTabVisible, setAccountsTabVisible] =
        useState<boolean>(false);
    const [forceCollapse, setForceCollapse] = useState<boolean>(false);
    const [menusExpanded, setMenusExpanded] = useState<Array<string>>([]);
    const [searchOptions, setSearchOptions] = useState<Array<string>>([]);
    const [searchQuery, setSearchQuery] = useState<string>("");

    // Refs
    const headerRef = useRef<HTMLElement>(null);

    // Hook invocations
    const { currentRoute, previousRoute } = useNavigationContext();
    const { isSearchBarVisible, setIsSearchBarVisible } =
        useMobileLogoAnimation({ headerRef });
    const { isShopMenuVisible, setShopMenuVisible, menuToggleRef } =
        useMobileMenuAnimation({
            headerRef,
            categories,
            menusExpandedLength: menusExpanded.length,
            setForceCollapse,
        });

    useEffect(() => {
        if (searchOptionsSlice.searchOptions) {
            setSearchOptions(searchOptionsSlice.searchOptions);
        }
    }, [searchOptionsSlice]);

    const handleCloseMenu = () => {
        if (menuToggleRef.current) {
            menuToggleRef.current.reverse();
            setShopMenuVisible(false);
        }
    };

    const handleOpenMenu = () => {
        if (menuToggleRef.current) {
            menuToggleRef.current.play();
            if (currentRoute && !currentRoute.includes("/shop")) {
                setIsSearchBarVisible(false);
            }
        }
    };

    useEffect(() => {
        if (currentRoute) {
            if (
                currentRoute.includes("/shop") &&
                !currentRoute.includes("cart") &&
                (!previousRoute || !previousRoute.includes("/shop"))
            ) {
                setIsSearchBarVisible(true);
            } else if (
                !currentRoute.includes("/shop") &&
                (!previousRoute ||
                    (previousRoute.includes("/shop") &&
                        !previousRoute.includes("cart")))
            ) {
                setIsSearchBarVisible(false);
            }
        }
    }, [currentRoute, previousRoute]);

    return (
        <header ref={headerRef}>
            <div className="m-blur-filter"></div>
            <div className="m-nav-bar">
                <LeftMobileMenu
                    handleOpenMenu={handleOpenMenu}
                    isSearchBarVisible={isSearchBarVisible}
                    setIsSearchBarVisible={setIsSearchBarVisible}
                />
                <div className="m-nav-logo">
                    <FullLogo mobile={true} />
                    <TextLogo />
                </div>
                <RightMobileMenu
                    accountsTabVisible={accountsTabVisible}
                    setAccountsTabVisible={setAccountsTabVisible}
                    cartContents={cartContents}
                />
            </div>
            <div className="m-account-tab"></div>
            <MobileMenuDrawer
                categories={categories}
                forceCollapse={forceCollapse}
                handleCloseMenu={handleCloseMenu}
                isShopMenuVisible={isShopMenuVisible}
                setShopMenuVisible={setShopMenuVisible}
                menusExpanded={menusExpanded}
                setMenusExpanded={setMenusExpanded}
            />
            <div className="m-search-tab-container">
                <div className="m-search-tab">
                    <div className="m-search-input">
                        <ProductSearchField
                            searchQuery={searchQuery}
                            setSearchQuery={setSearchQuery}
                            searchOptions={searchOptions}
                        />
                    </div>
                </div>
            </div>
            <AccountsTab
                setAccountsTabVisible={setAccountsTabVisible}
                accountsTabVisible={accountsTabVisible}
            />
        </header>
    );
};
export default MobileNav;
