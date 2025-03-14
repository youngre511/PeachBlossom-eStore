import React, { useState } from "react";
import SwapVertSharpIcon from "@mui/icons-material/SwapVertSharp";
import { ShopSortOrder } from "../../Shop";

interface MobileSortMethodSelectorProps {
    sort: ShopSortOrder;
    changeSortOrder: (sortName: ShopSortOrder) => void;
}
const MobileSortMethodSelector: React.FC<MobileSortMethodSelectorProps> = ({
    sort,
    changeSortOrder,
}) => {
    const [sortMenuVisible, setSortMenuVisible] = useState<boolean>(false);
    const selectedBtnStyle = {
        backgroundColor: "var(--deep-peach)",
        color: "white",
    };

    return (
        <React.Fragment>
            <button
                className="shop-sort-button"
                onClick={() => setSortMenuVisible(!sortMenuVisible)}
            >
                Sort
                <SwapVertSharpIcon
                    className="shop-sort-icon"
                    // fontSize="large"
                />
            </button>
            <div
                className="mobile-sort-menu"
                style={{
                    height: sortMenuVisible ? "240px" : 0,
                }}
            >
                <button
                    className="sort-buttons"
                    style={
                        sort === "name-ascend" ? selectedBtnStyle : undefined
                    }
                    onClick={() => {
                        changeSortOrder("name-ascend");
                        setSortMenuVisible(false);
                    }}
                >
                    A&ndash;Z
                </button>
                <button
                    className="sort-buttons"
                    style={
                        sort === "name-descend" ? selectedBtnStyle : undefined
                    }
                    onClick={() => {
                        changeSortOrder("name-descend");
                        setSortMenuVisible(false);
                    }}
                >
                    Z&ndash;A
                </button>
                <button
                    className="sort-buttons"
                    style={
                        sort === "price-ascend" ? selectedBtnStyle : undefined
                    }
                    onClick={() => {
                        changeSortOrder("price-ascend");
                        setSortMenuVisible(false);
                    }}
                >
                    $&ndash;$$$
                </button>
                <button
                    className="sort-buttons"
                    style={
                        sort === "price-descend" ? selectedBtnStyle : undefined
                    }
                    onClick={() => {
                        changeSortOrder("price-descend");
                        setSortMenuVisible(false);
                    }}
                >
                    $$$&ndash;$
                </button>
            </div>
        </React.Fragment>
    );
};
export default MobileSortMethodSelector;
