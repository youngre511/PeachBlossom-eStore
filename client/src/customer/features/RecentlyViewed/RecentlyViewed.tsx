import React from "react";
import { useRef } from "react";

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
    // const categories = ["Planters", "Decor", "Candles", "Throws"];
    const recently = useRef<HTMLDivElement>(null);

    return (
        <div
            className="recent-items"
            ref={recently}
            onMouseLeave={() => {
                handleRecentMouseLeave();
            }}
            onMouseEnter={() => {
                handleRecentMouseEnter();
            }}
            style={{ pointerEvents: isRecentVisible ? "auto" : "none" }}
        >
            <div className="recent-items-bkg"></div>
            <div className="recent-items-bkg-overlay"></div>
            <div className="recent-items-container">
                <div>Feature Coming Soon</div>
            </div>
        </div>
    );
};
export default RecentlyViewed;
