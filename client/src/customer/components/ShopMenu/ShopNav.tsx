import React from "react";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface Props {}
const ShopNav: React.FC<Props> = () => {
    const categories = ["Planters", "Decor", "Candles", "Throws"];
    const shopNav = useRef<HTMLDivElement>(null);
    const { contextSafe } = useGSAP({ scope: shopNav });

    const hideShopMen = contextSafe(() => {
        if (shopNav.current) {
            gsap.timeline()
                .to(shopNav.current, {
                    opacity: 0,
                    scale: 0.6,
                    ease: "back.out",
                })
                .set(shopNav.current, { display: "none" });
        }
    });

    return (
        <div className="shop-nav" ref={shopNav} onMouseLeave={hideShopMen}>
            <div className="shop-nav-bkg"></div>
            <div className="shop-nav-bkg-overlay"></div>
            <div className="shop-nav-menu">
                <p className="shop-all">
                    <Link to="/shop">Shop All</Link>
                </p>
                <ul>
                    {categories &&
                        categories.length > 0 &&
                        categories.map((category, index) => {
                            return (
                                <li key={index}>
                                    <Link to={`/shop?category=${category}`}>
                                        {category}
                                    </Link>
                                </li>
                            );
                        })}
                </ul>
            </div>
        </div>
    );
};
export default ShopNav;
