import { useState, useEffect, SetStateAction } from "react";

interface CheckoutStepValidationProps {
    activeStep: number;
    allAddressFieldsValid: boolean;
    email: string;
    paymentFormValid: boolean;
    setCanProceed: React.Dispatch<SetStateAction<boolean>>;
}

function useCheckoutStepValidation({
    activeStep,
    allAddressFieldsValid,
    email,
    paymentFormValid,
    setCanProceed,
}: CheckoutStepValidationProps): void {
    const [canProceedFromShipping, setCanProceedFromShipping] =
        useState<boolean>(false);
    const [canProceedFromPayment, setCanProceedFromPayment] =
        useState<boolean>(false);
    const [canPlaceOrder, setCanPlaceOrder] = useState<boolean>(false);

    useEffect(() => {
        setCanProceedFromShipping(allAddressFieldsValid);
    }, [allAddressFieldsValid]);

    useEffect(() => {
        setCanProceedFromPayment(paymentFormValid);
    }, [paymentFormValid]);

    useEffect(() => {
        let canProceed = true;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (email === "" || !emailRegex.test(email)) {
            canProceed = false;
        }

        setCanPlaceOrder(canProceed);
    }, [email]);

    useEffect(() => {
        switch (activeStep) {
            case 0:
                setCanProceed(canProceedFromShipping);
                break;
            case 1:
                setCanProceed(canProceedFromShipping && canProceedFromPayment);
                break;
            case 2:
                setCanProceed(
                    canProceedFromShipping &&
                        canProceedFromPayment &&
                        canPlaceOrder
                );
                break;
            default:
                throw new Error("Unknown step");
        }
    }, [
        activeStep,
        canProceedFromShipping,
        canProceedFromPayment,
        canPlaceOrder,
    ]);

    return;
}

export default useCheckoutStepValidation;
