import { useState, useEffect, useCallback } from "react";

interface WindowDimensions {
    width: number | null;
    height: number | null;
}

function useWindowDimensions(): WindowDimensions {
    const hasWindow = typeof window !== "undefined";

    function getWindowDimensions() {
        const width = hasWindow ? window.innerWidth : null;
        const height = hasWindow ? window.innerHeight : null;
        // console.log("width:", width);
        return { width: width, height: height };
    }

    const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>(
        getWindowDimensions()
    );

    useEffect(() => {
        if (hasWindow) {
            const handleResize = () => {
                const newDimensions = getWindowDimensions();
                setWindowDimensions(newDimensions);
            };

            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, [hasWindow]);

    return windowDimensions;
}

export default useWindowDimensions;
