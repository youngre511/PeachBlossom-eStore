import React from "react";
import "./nav.css";
import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ReactComponent as Search } from "../../../assets/img/search.svg";
import { ReactComponent as Cart } from "../../../assets/img/cart.svg";
import { ReactComponent as Recent } from "../../../assets/img/recent.svg";
import { ReactComponent as Account } from "../../../assets/img/account.svg";
import pblogo from "../../../assets/img/peach-blossom-logo.png";
import ShopNav from "../ShopMenu/ShopNav";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface Props {}
const Nav: React.FC<Props> = () => {
    const cartContents = 8;
    const header = useRef<HTMLElement>(null);

    const { contextSafe } = useGSAP({ scope: header });

    const revealShopMen = contextSafe(() => {
        gsap.timeline()
            .set(".shop-nav", { display: "block" })
            .to(".shop-nav", {
                duration: 0.2,
                opacity: 1,
                scale: 1,
                ease: "power1.inOut",
            });
    });

    return (
        <header ref={header}>
            <div className="blur-filter"></div>
            <div className="nav-bar">
                {/* Main Nav */}
                <ul className="left-menu">
                    <li className="nav-text" onMouseEnter={revealShopMen}>
                        Shop
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
                    <li className="nav-text">Orders</li>
                    <li className="nav-text">Support</li>
                    <li>
                        <div className="nav-icon" id="search" role="button">
                            <Search />
                        </div>
                    </li>
                    <li>
                        <div className="nav-icon" id="account" role="button">
                            <Account />
                        </div>
                    </li>
                    <li>
                        <div className="nav-icon" id="recents" role="button">
                            <Recent />
                        </div>
                    </li>
                    <li>
                        <div className="nav-icon" id="cart" role="button">
                            <Cart />
                            {cartContents > 0 && (
                                <div className="cart-badge">
                                    <div className="badge-background"></div>
                                    <div className="badge-background-overlay"></div>
                                    <p id="cart-contents">{cartContents}</p>
                                </div>
                            )}
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
                <ShopNav />
            </div>
        </header>
    );
};
export default Nav;
