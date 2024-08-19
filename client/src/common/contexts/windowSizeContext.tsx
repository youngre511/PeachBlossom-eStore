// WindowDimensionsContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import useWindowDimensions from "../hooks/useWindowDimensions";

interface WindowDimensions {
    width: number | null;
    height: number | null;
    isTouchDevice: boolean;
}

const WindowSizeContext = createContext<WindowDimensions | undefined>(
    undefined
);

export const WindowSizeProvider: React.FC<{ children: ReactNode }> = ({
    children,
}) => {
    const dimensions = useWindowDimensions();
    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;
    const windowInfo = { ...dimensions, isTouchDevice };

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
