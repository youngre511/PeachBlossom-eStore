/// <reference types="vite-plugin-svgr/client" />
import React, { SetStateAction, useContext } from "react";
import AccountButton from "../../../../../assets/img/account.svg?react";
import CartButton from "../../../../../assets/img/cart.svg?react";
import RecentButton from "../../../../../assets/img/recent.svg?react";
import SearchButton from "../../../../../assets/img/search.svg?react";
import { AuthContext } from "../../../../../common/contexts/authContext";
import { useNavigate } from "react-router-dom";

interface RightMenuProps {
    isSearchBarVisible: boolean;
    setIsSearchBarVisible: React.Dispatch<SetStateAction<boolean>>;
    accountsTabVisible: boolean;
    setAccountsTabVisible: React.Dispatch<SetStateAction<boolean>>;
    handleRecentMouseEnter: () => void;
    handleRecentMouseLeave: () => void;
    handleCartMouseEnter: () => void;
    handleCartMouseLeave: () => void;
    cartContents: number;
}
const RightMenu: React.FC<RightMenuProps> = ({
    isSearchBarVisible,
    setIsSearchBarVisible,
    accountsTabVisible,
    setAccountsTabVisible,
    handleRecentMouseEnter,
    handleRecentMouseLeave,
    handleCartMouseEnter,
    handleCartMouseLeave,
    cartContents,
}) => {
    const auth = useContext(AuthContext);
    const loggedIn = auth && auth.user && !auth.isTokenExpired();
    const navigate = useNavigate();

    return (
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
                    onClick={() => setIsSearchBarVisible(!isSearchBarVisible)}
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
                    onClick={() => setAccountsTabVisible(!accountsTabVisible)}
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
    );
};
export default RightMenu;
