import React, {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { useLocation } from "react-router-dom";

interface NavigationHistoryContextType {
    previousRoute: string | null;
}

const NavigationHistoryContext = createContext<
    NavigationHistoryContextType | undefined
>(undefined);

export const usePreviousRoute = (): NavigationHistoryContextType => {
    const context = useContext(NavigationHistoryContext);
    if (!context) {
        throw new Error(
            "usePreviousRoute must be used within a NavigationHistoryProvider"
        );
    }
    return context;
};

interface NavigationHistoryProviderProps {
    children: ReactNode;
}

export const NavigationHistoryProvider: React.FC<
    NavigationHistoryProviderProps
> = ({ children }) => {
    const location = useLocation();
    const [previousRoute, setPreviousRoute] = useState<string | null>(null);

    useEffect(() => {
        return () => setPreviousRoute(location.pathname + location.search);
    }, [location]);

    return (
        <NavigationHistoryContext.Provider value={{ previousRoute }}>
            {children}
        </NavigationHistoryContext.Provider>
    );
};
