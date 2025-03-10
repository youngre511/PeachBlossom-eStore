import React, { SetStateAction } from "react";
import { useEffect } from "react";
import BlankPopup from "../../../../common/components/BlankPopup";
import { Button } from "@mui/material";
import { useCheckoutTimer } from "../../../../common/contexts/checkoutTimerContext";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import axios from "axios";
import { setExpirationTime } from "../../Cart/cartSlice";
import { logAxiosError } from "../../../../common/utils/logAxiosError";

interface RenewDialogProps {
    cartId: number;
    setShowRenewDialog: React.Dispatch<SetStateAction<boolean>>;
    setDismissedRenewDialog: React.Dispatch<SetStateAction<boolean>>;
}
const RenewDialog: React.FC<RenewDialogProps> = ({
    cartId,
    setShowRenewDialog,
    setDismissedRenewDialog,
}) => {
    const { timeLeft } = useCheckoutTimer();
    const dispatch = useAppDispatch();

    const handleExtendSession = async () => {
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/inventory/extendHold`,
                { cartId: cartId }
            );
            dispatch(setExpirationTime({ expiration: response.data.payload }));
        } catch (error) {
            logAxiosError(error, "extending hold on stock");
        } finally {
            setShowRenewDialog(false);
            setDismissedRenewDialog(false);
        }
    };

    return (
        <React.Fragment>
            {timeLeft && (
                <BlankPopup>
                    <div>
                        Checkout will expire in {timeLeft.seconds}s. Extend
                        session?
                    </div>
                    <div className="extend-btns">
                        <Button
                            variant="contained"
                            onClick={handleExtendSession}
                        >
                            Yes
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setDismissedRenewDialog(true);
                                setShowRenewDialog(false);
                            }}
                        >
                            No
                        </Button>
                    </div>
                </BlankPopup>
            )}
        </React.Fragment>
    );
};
export default RenewDialog;
