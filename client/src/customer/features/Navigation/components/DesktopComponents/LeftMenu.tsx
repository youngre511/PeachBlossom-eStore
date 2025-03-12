import React, { SetStateAction } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface LeftMenuProps {
    handleShopMouseEnter: () => void;
    handleShopMouseLeave: () => void;
    setShopMenuVisible: React.Dispatch<SetStateAction<boolean>>;
}
const LeftMenu: React.FC<LeftMenuProps> = ({
    handleShopMouseEnter,
    handleShopMouseLeave,
    setShopMenuVisible,
}) => {
    const navigate = useNavigate();
    return (
        <ul className="left-menu">
            <li
                className="nav-text"
                onMouseEnter={() => handleShopMouseEnter()}
                onMouseLeave={() => handleShopMouseLeave()}
                onClick={() => {
                    setShopMenuVisible(false);
                    navigate("/shop");
                }}
                role="button"
            >
                Shop
            </li>
            <li
                className="nav-text"
                role="button"
                onClick={() => navigate("/about")}
            >
                About
            </li>
            <li
                className="nav-text"
                role="button"
                onClick={() => navigate("/sustainability")}
            >
                Sustainability
            </li>
        </ul>
    );
};
export default LeftMenu;
