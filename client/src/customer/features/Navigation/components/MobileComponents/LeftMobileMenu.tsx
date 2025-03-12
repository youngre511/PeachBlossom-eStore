/// <reference types="vite-plugin-svgr/client" />
import React, { SetStateAction } from "react";
import SearchButton from "../../../../../assets/img/search.svg?react";
import MenuSharpIcon from "@mui/icons-material/MenuSharp";

interface LeftMobileMenuProps {
    handleOpenMenu: () => void;
    isSearchBarVisible: boolean;
    setIsSearchBarVisible: React.Dispatch<SetStateAction<boolean>>;
}
const LeftMobileMenu: React.FC<LeftMobileMenuProps> = ({
    handleOpenMenu,
    isSearchBarVisible,
    setIsSearchBarVisible,
}) => {
    return (
        <div className="m-left-navbar">
            <div
                className="m-nav-icon"
                id="menu-button"
                onClick={handleOpenMenu}
            >
                <MenuSharpIcon />
            </div>
            <div
                className="m-nav-icon"
                id="search"
                aria-label="search"
                tabIndex={0}
                role="button"
                onClick={() => setIsSearchBarVisible(!isSearchBarVisible)}
            >
                <SearchButton />
            </div>
        </div>
    );
};
export default LeftMobileMenu;
