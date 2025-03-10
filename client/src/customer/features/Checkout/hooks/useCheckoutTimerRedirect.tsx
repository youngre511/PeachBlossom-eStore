import { useEffect, SetStateAction } from "react";
import { useCheckoutTimer } from "../../../../common/contexts/checkoutTimerContext";
import { useNavigate } from "react-router-dom";

interface CheckoutTimerRedirectProps {
    dismissedRenewDialog: boolean;
    setShowRenewDialog: React.Dispatch<SetStateAction<boolean>>;
}

function useCheckoutTimerRedirect({
    dismissedRenewDialog,
    setShowRenewDialog,
}: CheckoutTimerRedirectProps): void {
    const { timeLeft } = useCheckoutTimer();
    const navigate = useNavigate();

    useEffect(() => {
        if (timeLeft) {
            if (timeLeft.minutes === 0 && timeLeft.seconds === 0) {
                navigate("/shoppingcart");
            } else if (
                timeLeft.minutes === 0 &&
                timeLeft.seconds < 16 &&
                !dismissedRenewDialog
            ) {
                setShowRenewDialog(true);
            }
        }
        return;
    }, [timeLeft]);
}

export default useCheckoutTimerRedirect;
