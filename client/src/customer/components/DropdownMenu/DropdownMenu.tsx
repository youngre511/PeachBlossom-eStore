import React, { ReactNode } from "react";
import { useEffect } from "react";
import "./dropdown.css";

interface DropdownMenuProps {
    children: ReactNode;
    className: string;
    handleMouseEnter: () => void;
    handleMouseLeave: () => void;
    visibilityState: boolean;
    arrowLeft: boolean;
    heightPx: number;
    leftPx?: number;
    rightPx?: number;
    minHeightPx?: number;
    maxHeight?: string;
}
const DropdownMenu: React.FC<DropdownMenuProps> = ({
    children,
    className,
    handleMouseEnter,
    handleMouseLeave,
    visibilityState,
    arrowLeft,
    heightPx,
    minHeightPx,
    maxHeight,
    leftPx,
    rightPx,
}) => {
    const bkgStyle: React.CSSProperties & { [key: `--${string}`]: string } = {
        height: `${heightPx}px`,
        maxHeight: maxHeight,
        "--arrow-inset": arrowLeft ? "12px auto" : "auto 6px",
    };

    const bkgOverStyle: React.CSSProperties & { [key: `--${string}`]: string } =
        {
            "--after-pos": arrowLeft ? `10% 20%` : "10% 10%",
            "--after-size": arrowLeft ? `600px ${heightPx * 2}px` : `200%`,
            height: `${heightPx}px`,
            maxHeight: maxHeight,
            "--arrow-inset": arrowLeft ? "12px auto" : "auto 6px",
        };

    const foreStyle: React.CSSProperties & { [key: `--${string}`]: string } = {
        height: `${heightPx - 8}px`,
        maxHeight: maxHeight ? `calc(${maxHeight} - 8px)` : undefined,
        "--arrow-inset": arrowLeft ? "8px auto" : "auto 2px",
    };

    return (
        <div
            className={`${className} dropdown`}
            onMouseEnter={() => handleMouseEnter()}
            onMouseLeave={() => handleMouseLeave()}
            style={{
                pointerEvents: visibilityState ? "auto" : "none",
                left: leftPx ? `${leftPx}px` : undefined,
                right: rightPx ? `${rightPx}px` : undefined,
                height: minHeightPx ? undefined : `${heightPx + 15}px`,
                minHeight: minHeightPx ? `${minHeightPx}px` : undefined,
                maxHeight: maxHeight ? maxHeight : undefined,
            }}
        >
            <div
                className={`${className}-bkg dropdown-bkg`}
                style={bkgStyle}
            ></div>
            <div
                className={`${className}-bkg-overlay dropdown-bkg-overlay`}
                style={bkgOverStyle}
            ></div>
            <div
                className={`${className}-container dropdown-container`}
                style={foreStyle}
            >
                {children}
            </div>
        </div>
    );
};
export default DropdownMenu;
