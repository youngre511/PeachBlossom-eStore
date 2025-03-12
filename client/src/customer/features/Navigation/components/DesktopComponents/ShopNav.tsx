import React from "react";
import { Link } from "react-router-dom";
import { useAppSelector } from "../../../../hooks/reduxHooks";
import { RootState } from "../../../../store/customerStore";
import "./shop-nav.css";
import DropdownMenu from "../../../../components/DropdownMenu/DropdownMenu";

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
    const categories = useAppSelector(
        (state: RootState) => state.categories.categories
    );

    return (
        <DropdownMenu
            className="shop-nav"
            handleMouseLeave={handleShopMouseLeave}
            handleMouseEnter={handleShopMouseEnter}
            visibilityState={isShopMenuVisible}
            heightPx={400}
            leftPx={20}
            arrowLeft={true}
        >
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
                                    to={`/shop?category=${category.categoryName.replace(
                                        "&",
                                        "%26"
                                    )}`}
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
                                                            to={`/shop?category=${category.categoryName.replace(
                                                                "&",
                                                                "%26"
                                                            )}&sub_category=${encodeURI(
                                                                subcategory.subcategoryName.replace(
                                                                    "&",
                                                                    "%26"
                                                                )
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
        </DropdownMenu>
    );
};
export default ShopNav;
