import React, { SetStateAction } from "react";
import { useEffect } from "react";
import ChevronLeftSharpIcon from "@mui/icons-material/ChevronLeftSharp";
import MobileMenuDrawerContent from "./MobileMenuDrawerContent";
import MobileShopNav from "./MobileShopNav";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import { Category } from "../../../../../store/categories/CategoriesTypes";

interface MobileMenuDrawerProps {
    categories: Category[];
    forceCollapse: boolean;
    handleCloseMenu: () => void;
    isShopMenuVisible: boolean;
    setShopMenuVisible: React.Dispatch<SetStateAction<boolean>>;
    menusExpanded: string[];
    setMenusExpanded: React.Dispatch<SetStateAction<string[]>>;
}
const MobileMenuDrawer: React.FC<MobileMenuDrawerProps> = ({
    categories,
    forceCollapse,
    handleCloseMenu,
    isShopMenuVisible,
    setShopMenuVisible,
    menusExpanded,
    setMenusExpanded,
}) => {
    const menuItems: [name: string, path: string][] = [
        ["Order Status", "/order-status"],
        ["Support", "/support"],
        ["About", "/about"],
        ["Sustainability", "/sustainability"],
    ];

    return (
        <div className="m-menu-drawer-container">
            <div className="m-menu-drawer-backdrop" />
            <div className="m-menu-drawer">
                <div className="m-menu-drawer-header">
                    {isShopMenuVisible ? (
                        <div className="m-menu-title">
                            <button
                                className="m-back-button"
                                onClick={() => setShopMenuVisible(false)}
                            >
                                <ChevronLeftSharpIcon
                                    sx={{
                                        width: "20px",
                                        paddingTop: "5px",
                                    }}
                                />
                                <h2>Shop</h2>
                            </button>
                        </div>
                    ) : (
                        <div className="m-menu-title">
                            <h2>Menu</h2>
                        </div>
                    )}
                    <button
                        className="m-close-button"
                        onClick={handleCloseMenu}
                    >
                        <CloseSharpIcon
                            sx={{ width: "20px", height: "20px" }}
                        />
                    </button>
                </div>
                <MobileMenuDrawerContent
                    categories={categories}
                    menuItems={menuItems}
                    setShopMenuVisible={setShopMenuVisible}
                    handleCloseMenu={handleCloseMenu}
                />
                <MobileShopNav
                    handleCloseMenu={handleCloseMenu}
                    categories={categories}
                    menuItemsLength={menuItems.length + 1}
                    menusExpanded={menusExpanded}
                    setMenusExpanded={setMenusExpanded}
                    forceCollapse={forceCollapse}
                />
            </div>
        </div>
    );
};
export default MobileMenuDrawer;
