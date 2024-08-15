import { useState, useEffect } from "react";

interface WindowDimensions {
    width: number | null;
    height: number | null;
}

function useWindowDimensions(): WindowDimensions {
    const hasWindow = typeof window !== "undefined";

    function getWindowDimensions() {
        const width = hasWindow ? window.innerWidth : null;
        const height = hasWindow ? window.innerHeight : null;
        return { width: width, height: height };
    }

    const [windowDimensions, setWindowDimensions] = useState<WindowDimensions>(
        getWindowDimensions()
    );

    useEffect(() => {
        if (hasWindow) {
            const handleResize = () => {
                setWindowDimensions(getWindowDimensions());
            };

            window.addEventListener("resize", handleResize);
            return () => window.removeEventListener("resize", handleResize);
        }
    }, [hasWindow]);

    return windowDimensions;
}

export default useWindowDimensions;
