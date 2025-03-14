import { useState, useEffect, useCallback, SetStateAction } from "react";

interface OrderEventHandlersProps {
    shipping: string;
    setShipping: React.Dispatch<SetStateAction<string>>;
    tax: string;
    setTax: React.Dispatch<SetStateAction<string>>;
    setTotal: React.Dispatch<SetStateAction<string>>;
    setEmailHelperText: React.Dispatch<SetStateAction<string>>;
    subTotal: string;
}

interface OrderEventHandlers {
    handleShippingInput: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        setAction: React.Dispatch<SetStateAction<string>>
    ) => void;
    handleShippingBlur: (
        event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
        setAction: React.Dispatch<SetStateAction<string>>
    ) => void;
    handleEmailBlur: (
        event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
}

function useOrderEventHandlers({
    shipping,
    tax,
    setTax,
    setTotal,
    setEmailHelperText,
    subTotal,
}: OrderEventHandlersProps): OrderEventHandlers {
    const handleShippingInput = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        setAction: React.Dispatch<SetStateAction<string>>
    ) => {
        const regex = new RegExp("^\\d*\\.?\\d{0,2}$");
        const { value } = event.target;
        if (regex.test(value) || value === "") {
            event.target.value = value;
            setAction(value);
        } else {
            event.target.value = value.slice(0, -1);
        }
    };

    const handleShippingBlur = (
        event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
        setAction: React.Dispatch<SetStateAction<string>>
    ) => {
        const { value } = event.currentTarget;
        const newValue =
            Number(value) > 0 ? String(Number(value).toFixed(2)) : "";
        setAction(newValue);
        setTax(String(((+subTotal + +shipping) * 0.06).toFixed(2)));
        setTotal(String((+subTotal + +tax + +shipping).toFixed(2)));
        event.currentTarget.value = newValue;
    };

    const handleEmailBlur = (
        event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { value } = event.target;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (emailRegex.test(value)) {
            console.log("valid");
            setEmailHelperText("");
        } else {
            console.log("invalid");
            setEmailHelperText("Please enter a valid email address");
        }
    };

    return {
        handleShippingInput,
        handleShippingBlur,
        handleEmailBlur,
    };
}

export default useOrderEventHandlers;
