import React, { SetStateAction } from "react";
import ChevronRightSharpIcon from "@mui/icons-material/ChevronRightSharp";
import { useNavigate } from "react-router-dom";
import { Category } from "../../../../../store/categories/CategoriesTypes";

interface MobileMenuDrawerContentProps {
    categories: Category[];
    menuItems: [string, string][];
    setShopMenuVisible: React.Dispatch<SetStateAction<boolean>>;
    handleCloseMenu: () => void;
}
const MobileMenuDrawerContent: React.FC<MobileMenuDrawerContentProps> = ({
    categories,
    menuItems,
    setShopMenuVisible,
    handleCloseMenu,
}) => {
    const navigate = useNavigate();
    return (
        <div className="m-main-menu">
            <ul className="m-menu-items">
                <li onClick={() => setShopMenuVisible(true)}>
                    <button id="m-shop-button">
                        Shop <ChevronRightSharpIcon sx={{ width: "20px" }} />
                    </button>
                </li>
                {menuItems.map(([name, path]) => (
                    <li>
                        <button
                            onClick={() => {
                                navigate(path);
                                handleCloseMenu();
                            }}
                        >
                            {name}
                        </button>
                    </li>
                ))}
                {/* Pad with empty li elements if categories is longer than menu items */}
                {categories &&
                    categories.length > 5 &&
                    Array(categories.length - 5)
                        .fill("")
                        .map((_, index) => (
                            <li
                                style={{ height: "54px" }}
                                key={`empty-li-${index}`}
                            ></li>
                        ))}
            </ul>
        </div>
    );
};
export default MobileMenuDrawerContent;
