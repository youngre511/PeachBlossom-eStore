import { SetStateAction } from "react";

interface ExpirationFormatterProps {
    input: HTMLInputElement;
    setExpirationInvalid: React.Dispatch<SetStateAction<boolean>>;
}

interface ExpirationFormatter {
    formattedValue: string;
}

// Format credit card expiration (MM/YY) and keep cursor in original spot when doing so
function useExpirationFormatter({
    input,
    setExpirationInvalid,
}: ExpirationFormatterProps): ExpirationFormatter {
    let cursorPosition = input.selectionStart;
    const value = input.value.replace(/\D/g, "");
    const formattedValue = value.replace(/(\d{2})(?=\d{2})/, "$1/");

    if (
        formattedValue.length !== 5 ||
        Number(formattedValue.substring(0, 2)) > 12 ||
        Number(formattedValue.substring(0, 2)) === 0
    ) {
        setExpirationInvalid(true);
    } else {
        setExpirationInvalid(false);
    }

    // Restore cursor position

    if (cursorPosition) {
        let newCursorPosition = cursorPosition;
        // If a backslash was added but the cursor was after the second digit, move cursor one step forward
        if (value[cursorPosition] === "/" && !value.includes("/")) {
            newCursorPosition++;
        }
        setTimeout(() => {
            input.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);
    }

    return { formattedValue };
}

export default useExpirationFormatter;
