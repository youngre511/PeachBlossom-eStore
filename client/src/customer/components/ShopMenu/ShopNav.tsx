import React from "react";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/customerStore";
import "./shop-menu.css";

interface Props {
    isShopMenuVisible: boolean;
    handleShopMouseEnter: () => void;
    handleShopMouseLeave: () => void;
}
const ShopNav: React.FC<Props> = ({
    isShopMenuVisible,
    handleShopMouseEnter,
    handleShopMouseLeave,
}) => {
    // const categories = ["Planters", "Decor", "Candles", "Throws"];
    const shopNav = useRef<HTMLDivElement>(null);
    const { contextSafe } = useGSAP({ scope: shopNav });
    const categories = useAppSelector(
        (state: RootState) => state.categories.categories
    );

    return (
        <div
            className="shop-nav"
            ref={shopNav}
            onMouseLeave={() => {
                handleShopMouseLeave();
            }}
            onMouseEnter={() => {
                handleShopMouseEnter();
            }}
            style={{ pointerEvents: isShopMenuVisible ? "auto" : "none" }}
        >
            <div className="shop-nav-bkg"></div>
            <div className="shop-nav-bkg-overlay"></div>
            <div className="shop-nav-menu">
                <p className="shop-all">
                    <Link to="/shop">Shop All</Link>
                </p>
                <ul className="shopnav-options">
                    {categories &&
                        categories.length > 0 &&
                        categories.map((category, index) => {
                            return (
                                <li key={index}>
                                    <Link
                                        to={`/shop?category=${category.categoryName}`}
                                    >
                                        {category.categoryName}
                                    </Link>
                                    {category.Subcategory &&
                                        category.Subcategory.length > 0 && (
                                            <ul className="shopnav-subcategory-list">
                                                {category.Subcategory.map(
                                                    (subcategory, index) => (
                                                        <li key={index}>
                                                            <Link
                                                                to={`/shop?category=${
                                                                    category.categoryName
                                                                }&sub_category=${encodeURI(
                                                                    subcategory.subcategoryName
                                                                )}`}
                                                            >
                                                                {
                                                                    subcategory.subcategoryName
                                                                }
                                                            </Link>
                                                        </li>
                                                    )
                                                )}
                                            </ul>
                                        )}
                                </li>
                            );
                        })}
                </ul>
            </div>
        </div>
    );
};
export default ShopNav;
