import React, { SetStateAction } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MobileShopCategoryBlock from "./MobileShopCategoryBlock";
import { Category } from "../../../../../store/categories/CategoriesTypes";

interface MobileShopNavProps {
    handleCloseMenu: () => void;
    categories: Category[];
    menuItemsLength: number;
    menusExpanded: string[];
    setMenusExpanded: React.Dispatch<SetStateAction<string[]>>;
    forceCollapse: boolean;
}
const MobileShopNav: React.FC<MobileShopNavProps> = ({
    handleCloseMenu,
    categories,
    menuItemsLength,
    menusExpanded,
    setMenusExpanded,
    forceCollapse,
}) => {
    const navigate = useNavigate();
    return (
        <div className="m-shop-menu">
            <div className=".m-shop-category-block">
                <div
                    className="m-shop-category"
                    style={{ fontWeight: 700 }}
                    onClick={() => {
                        navigate(`/shop`);
                        handleCloseMenu();
                    }}
                >
                    Shop All
                </div>
            </div>
            {categories &&
                categories.map((category) => {
                    return (
                        <MobileShopCategoryBlock
                            category={category}
                            forceCollapse={forceCollapse}
                            menusExpanded={menusExpanded}
                            setMenusExpanded={setMenusExpanded}
                            key={category.categoryName}
                            handleCloseMenu={handleCloseMenu}
                        />
                    );
                })}
            {/* Pad with empty divs if categories is shorter than menu items */}
            {categories &&
                categories.length + 1 < menuItemsLength &&
                Array(menuItemsLength - categories.length + 1)
                    .fill("")
                    .map((_, index) => (
                        <div
                            className="m-shop-category-block"
                            key={`empty-block-${index}`}
                            style={{
                                height: "54px",
                                width: "100%",
                            }}
                        ></div>
                    ))}
        </div>
    );
};
export default MobileShopNav;
