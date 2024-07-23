import React from "react";
import { Link } from "react-router-dom";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/customerStore";
import "./shop-menu.css";

interface Props {
    setShopMenuVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
const ShopNav: React.FC<Props> = ({ setShopMenuVisible }) => {
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
            onMouseLeave={() => setShopMenuVisible(false)}
            onMouseEnter={() => setShopMenuVisible(true)}
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
                                    {category.SubCategory.length > 0 && (
                                        <ul className="shopnav-subcategory-list">
                                            {category.SubCategory.map(
                                                (subCategory, index) => (
                                                    <li key={index}>
                                                        <Link
                                                            to={`/shop?category=${
                                                                category.categoryName
                                                            }&sub_category=${encodeURI(
                                                                subCategory.subCategoryName
                                                            )}`}
                                                        >
                                                            {
                                                                subCategory.subCategoryName
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
