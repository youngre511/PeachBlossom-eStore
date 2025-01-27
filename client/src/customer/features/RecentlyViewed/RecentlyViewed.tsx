import React from "react";
import DropdownMenu from "../../components/DropdownMenu/DropdownMenu";
import { useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/customerStore";
import "./recently-viewed.css";
import { useNavigate } from "react-router-dom";

interface Props {
    isRecentVisible: boolean;
    handleRecentMouseEnter: () => void;
    handleRecentMouseLeave: () => void;
}
const RecentlyViewed: React.FC<Props> = ({
    isRecentVisible,
    handleRecentMouseEnter,
    handleRecentMouseLeave,
}) => {
    const recentlyViewed = useAppSelector(
        (state: RootState) => state.userData.data.recentlyViewed
    );

    const navigate = useNavigate();

    return (
        <DropdownMenu
            className="recent-items"
            arrowLeft={false}
            handleMouseEnter={handleRecentMouseEnter}
            handleMouseLeave={handleRecentMouseLeave}
            visibilityState={isRecentVisible}
            heightPx={130 + recentlyViewed.length * 120}
            rightPx={55}
            maxHeight="80dvh"
        >
            <div className="recent-wrapper">
                <h1>Recently Viewed</h1>
                <div className="recent-list">
                    {recentlyViewed.length > 0 &&
                        recentlyViewed.map((product) => (
                            <div
                                className="recent-item"
                                onClick={() => {
                                    navigate(
                                        `/product?pn=${product.productNo}`
                                    );
                                    handleRecentMouseLeave();
                                }}
                            >
                                <img
                                    className="recent-thumb"
                                    src={`${product.thumbnailUrl}_300.webp`}
                                />
                                <div className="recent-name">
                                    {product.productName}
                                </div>
                            </div>
                        ))}
                    {recentlyViewed.length === 0 && (
                        <div>You don't have any recently viewed items.</div>
                    )}
                </div>
            </div>
        </DropdownMenu>
    );
};
export default RecentlyViewed;
