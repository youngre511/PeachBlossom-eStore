export const sanitizeZipcode = (input: HTMLInputElement) => {
    let value = input.value;
    let cursorPosition = input.selectionStart;
    // Remove all characters other than numerals.
    // Then insert a dash after the first five characters only if there is at least one more character after that.
    let newValue = value
        .replace(/[^0-9]/g, "")
        .substring(0, 9)
        .replace(/(\d{5})(?=\d{1})/, "$1-");

    // Restore cursor position

    if (cursorPosition) {
        let newCursorPosition = cursorPosition;
        // If a hyphen was added but the cursor was after the 5th digit, move cursor one step forward
        if (value[cursorPosition] === "-" && !value.includes("-")) {
            newCursorPosition++;
        }
        setTimeout(() => {
            input.setSelectionRange(newCursorPosition, newCursorPosition);
        }, 0);
    }

    return newValue;
};

export const validStates = [
    "AK",
    "AL",
    "AR",
    "AZ",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "IA",
    "ID",
    "IL",
    "IN",
    "KS",
    "KY",
    "LA",
    "MA",
    "MD",
    "ME",
    "MI",
    "MN",
    "MO",
    "MS",
    "MT",
    "NC",
    "ND",
    "NE",
    "NH",
    "NJ",
    "NM",
    "NV",
    "NY",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VA",
    "VT",
    "WA",
    "WI",
    "WV",
    "WY",
];
