import React, { ChangeEvent, ReactNode } from "react";
import { TextField } from "@mui/material";

interface NumberTextFieldProps {
    productNo: string;
    value: string | "";
    style?: Record<string, string>;
    setPendingInventoryUpdates: React.Dispatch<
        React.SetStateAction<Record<string, number>>
    >;
    pendingInventoryUpdates: Record<string, number>;
    endAdornment?: ReactNode;
    startAdornment?: ReactNode;
}

const StockField: React.FC<NumberTextFieldProps> = ({
    productNo,
    value,
    style,
    setPendingInventoryUpdates,
    pendingInventoryUpdates,
    endAdornment,
    startAdornment,
}) => {
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const regex = /^\d+$/;

        if (regex.test(value) || value === "") {
            setPendingInventoryUpdates({
                ...pendingInventoryUpdates,
                [productNo]: +value,
            });
        }
    };

    return (
        <TextField
            value={value}
            onChange={handleInputChange}
            slotProps={{
                htmlInput: {
                    inputMode: "numeric",
                    pattern: "[0-9]*\\.?[0-9]{0,2}",
                },
            }}
            type="number"
            sx={style}
            size="small"
            fullWidth
        />
    );
};
export default StockField;
