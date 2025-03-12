/// <reference types="vite-plugin-svgr/client" />
import React, { SetStateAction } from "react";
import CartButton from "../../../../../assets/img/cart.svg?react";
import AccountButton from "../../../../../assets/img/account.svg?react";
import { useNavigate } from "react-router-dom";

interface RightMobileMenuProps {
    accountsTabVisible: boolean;
    setAccountsTabVisible: React.Dispatch<SetStateAction<boolean>>;
    cartContents: number;
}
const RightMobileMenu: React.FC<RightMobileMenuProps> = ({
    accountsTabVisible,
    setAccountsTabVisible,
    cartContents,
}) => {
    const navigate = useNavigate();
    return (
        <div className="m-right-navbar">
            <div
                className="m-nav-icon"
                id="account"
                aria-label="account"
                onClick={() => setAccountsTabVisible(!accountsTabVisible)}
                tabIndex={0}
                role="button"
            >
                <AccountButton />
            </div>
            <div
                className="m-nav-icon"
                id="mobile-cart"
                aria-label="cart"
                tabIndex={0}
                role="button"
                onClick={() => navigate("/shoppingcart")}
            >
                <CartButton />
                {cartContents > 0 && (
                    <div className="m-cart-badge" aria-live="polite">
                        <div className="m-badge-background"></div>
                        <div className="m-badge-background-overlay"></div>
                        <p
                            id="cart-contents"
                            aria-label={`Cart with ${cartContents} items`}
                        >
                            {cartContents}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default RightMobileMenu;
