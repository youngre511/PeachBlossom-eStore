import { useEffect, SetStateAction } from "react";

interface PaymentFormValidationProps {
    setPaymentFormValid: React.Dispatch<SetStateAction<boolean>>;
    name: string;
    expirationInvalid: boolean;
}

function usePaymentFormValidation({
    setPaymentFormValid,
    name,
    expirationInvalid,
}: PaymentFormValidationProps): void {
    useEffect(() => {
        if (name.replaceAll(" ", "").length > 0 && !expirationInvalid) {
            setPaymentFormValid(true);
        } else {
            setPaymentFormValid(false);
        }
    }, [name, expirationInvalid, setPaymentFormValid]);

    return;
}

export default usePaymentFormValidation;
