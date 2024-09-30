// WindowDimensionsContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import useWindowDimensions from "../hooks/useWindowDimensions";

interface WindowDimensions {
    width: number | null;
    height: number | null;
    isTouchDevice: boolean;
    pixelDensity: number;
}

const WindowSizeContext = createContext<WindowDimensions | undefined>(
    undefined
);

export const WindowSizeProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const dimensions = useWindowDimensions();
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    // Determine pixel ratio and convert to pixel density for preloading images
    const pixelDensity =
        window.devicePixelRatio >= 3 ? 3 : window.devicePixelRatio >= 2 ? 2 : 1;

    const windowInfo = { ...dimensions, isTouchDevice, pixelDensity };

    return (
        <WindowSizeContext.Provider value={windowInfo}>
            {children}
        </WindowSizeContext.Provider>
    );
};

export const useWindowSizeContext = () => {
    const context = useContext(WindowSizeContext);
    if (context === undefined) {
        throw new Error(
            "useWindowDimensionsContext must be used within a WindowDimensionsProvider"
        );
    }
    return context;
};
