import React, {
    createContext,
    ReactNode,
    SetStateAction,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { useAppSelector } from "../../customer/hooks/reduxHooks";
import { RootState } from "../../customer/store/customerStore";

interface CheckoutTimerContextType {
    timeLeft: { minutes: number; seconds: number } | null;
    setTimerEnd: React.Dispatch<SetStateAction<Date | null>>;
}

const CheckoutTimerContext = createContext<
    CheckoutTimerContextType | undefined
>(undefined);

export const useCheckoutTimer = (): CheckoutTimerContextType => {
    const context = useContext(CheckoutTimerContext);
    if (!context) {
        throw new Error(
            "useCheckoutTimer must be used within a NavigationHistoryProvider"
        );
    }
    return context;
};

interface CheckoutTimerProviderProps {
    children: ReactNode;
}

export const CheckoutTimerProvider: React.FC<CheckoutTimerProviderProps> = ({
    children,
}) => {
    const [timeLeft, setTimeLeft] = useState<{
        minutes: number;
        seconds: number;
    } | null>(null);
    const [timerEnd, setTimerEnd] = useState<Date | null>(null);
    const expirationTime = useAppSelector(
        (state: RootState) => state.cart.expirationTime
    );
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (expirationTime) {
            const localExpirationTime = new Date(expirationTime);
            if (localExpirationTime !== timerEnd) {
                setTimerEnd(localExpirationTime);
            }
        } else {
            setTimerEnd(null);
            setTimeLeft(null);
        }
    }, [expirationTime]);

    useEffect(() => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
        if (timerEnd) {
            timerIntervalRef.current = setInterval(() => {
                if (timerEnd) {
                    const timeDifference = +new Date(timerEnd) - +new Date();
                    if (timeDifference <= 0) {
                        setTimerEnd(null);
                        setTimeLeft(null);
                        if (timerIntervalRef.current) {
                            clearInterval(timerIntervalRef.current);
                        }
                        timerIntervalRef.current = null;
                    } else {
                        const minutesLeft = Math.floor(
                            (timeDifference / 1000 / 60) % 60
                        );
                        const secondsLeft = Math.floor(
                            (timeDifference / 1000) % 60
                        );

                        setTimeLeft({
                            minutes: minutesLeft,
                            seconds: secondsLeft,
                        });
                    }
                }
            }, 1000);
        }
        return () => {
            if (timerIntervalRef.current) {
                clearInterval(timerIntervalRef.current);
                timerIntervalRef.current = null;
            }
        };
    }, [timerEnd, timerIntervalRef.current]);

    return (
        <CheckoutTimerContext.Provider value={{ timeLeft, setTimerEnd }}>
            {children}
        </CheckoutTimerContext.Provider>
    );
};
