import React from "react";
import "./nav.css";
import { useEffect, useRef, useState } from "react";
import { useAppSelector } from "../../hooks/reduxHooks";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ReactComponent as SearchButton } from "../../../assets/img/search.svg";
import { ReactComponent as CartButton } from "../../../assets/img/cart.svg";
import { ReactComponent as RecentButton } from "../../../assets/img/recent.svg";
import { ReactComponent as AccountButton } from "../../../assets/img/account.svg";
import pblogo from "../../../assets/img/peach-blossom-logo.png";
import ShopNav from "../ShopMenu/ShopNav";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import CartDropDown from "../../features/Cart/CartDropDown";
import { RootState } from "../../store/customerStore";

interface Props {}
const Nav: React.FC<Props> = () => {
    const cart = useAppSelector((state: RootState) => state.cart);
    const cartContents = cart.numberOfItems;
    console.log("cart:", cart);
    const header = useRef<HTMLElement>(null);

    const [isShopMenuVisible, setShopMenuVisible] = useState(false);
    const [isCartDropdownVisible, setCartDropdownVisible] = useState(false);

    const { contextSafe } = useGSAP({ scope: header });
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(
        contextSafe(() => {
            if (isShopMenuVisible) {
                gsap.timeline()
                    .set(".shop-nav", { display: "block" })
                    .to(".shop-nav", {
                        duration: 0.2,
                        opacity: 1,
                        scale: 1,
                        ease: "power1.inOut",
                    });
            } else {
                gsap.timeline()
                    .to(".shop-nav", {
                        opacity: 0,
                        scale: 0.6,
                        ease: "back.out",
                    })
                    .set(".shop-nav", { display: "none" });
            }
        }),
        [isShopMenuVisible]
    );

    useEffect(
        contextSafe(() => {
            if (cartContents > 0) {
                if (
                    isCartDropdownVisible &&
                    location.pathname != "/shoppingcart"
                ) {
                    gsap.timeline()
                        .set(".drop-cart", { display: "block" })
                        .to(".drop-cart", {
                            duration: 0.2,
                            opacity: 1,
                            scale: 1,
                            ease: "power1.inOut",
                        });
                } else {
                    gsap.timeline()
                        .to(".drop-cart", {
                            opacity: 0,
                            scale: 0.6,
                            ease: "back.out",
                        })
                        .set(".drop-cart", { display: "none" });
                }
            }
        }),
        [isCartDropdownVisible]
    );

    return (
        <header ref={header}>
            <div className="blur-filter"></div>
            <div className="nav-bar">
                {/* Main Nav */}
                <ul className="left-menu">
                    <li
                        className="nav-text"
                        onMouseEnter={() => setShopMenuVisible(true)}
                        onMouseLeave={() => setShopMenuVisible(false)}
                    >
                        <Link
                            to="/shop"
                            onClick={() => setShopMenuVisible(false)}
                        >
                            Shop
                        </Link>
                    </li>
                    <li className="nav-text">
                        <Link to="/about">About</Link>
                    </li>
                    <li className="nav-text">
                        <Link to="/sustainability">Sustainability</Link>
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
                    <li className="nav-text">
                        <Link to="/order-status">Orders</Link>
                    </li>
                    <li className="nav-text">Support</li>
                    <li>
                        <div
                            className="nav-icon"
                            id="search"
                            aria-label="search"
                            tabIndex={0}
                            role="button"
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
                        >
                            <AccountButton />
                        </div>
                    </li>
                    <li>
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
                    <li>
                        <div
                            className="nav-icon"
                            id="cart"
                            aria-label="cart"
                            tabIndex={0}
                            role="button"
                            onMouseEnter={() => setCartDropdownVisible(true)}
                            onMouseLeave={() => setCartDropdownVisible(false)}
                            onClick={() => navigate("/shoppingcart")}
                        >
                            <Link
                                to="/shoppingcart"
                                onClick={() => setCartDropdownVisible(false)}
                            >
                                <CartButton />
                                {cartContents > 0 && (
                                    <div
                                        className="cart-badge"
                                        aria-live="polite"
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
                            </Link>
                        </div>
                    </li>
                </ul>
                {/* Floats */}
                <div className="search-tab"></div>
                <div className="nav-logo">
                    <div className="border-under"></div>
                    <div className="border-over"></div>
                    <img src={pblogo} alt="" />
                </div>
                <ShopNav setShopMenuVisible={setShopMenuVisible} />
                <CartDropDown setCartDropdownVisible={setCartDropdownVisible} />
            </div>
        </header>
    );
};
export default Nav;
