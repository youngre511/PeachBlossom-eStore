import React, { ChangeEvent, ReactNode } from "react";
import { TextField, InputAdornment } from "@mui/material";
import { Filters } from "../../../customer/features/ProductCatalog/CatalogTypes";

interface DecimalTextFieldProps {
    label: string;
    param: string;
    value: string | "";
    setLocalFilters: React.Dispatch<React.SetStateAction<Filters>>;
    formatFunction?: (value: string) => string;
    style: Record<string, string>;
    endAdornment?: ReactNode;
}

const DecimalField: React.FC<DecimalTextFieldProps> = ({
    label,
    param,
    value = "",
    setLocalFilters,
    formatFunction,
    style,
    endAdornment,
}) => {
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const regex = /^\d*\.?\d{0,2}$/;

        if (regex.test(value) || value === "") {
            setLocalFilters((prevFilters) => ({
                ...prevFilters,
                [param]: value,
            }));
        }
    };

    const handleBlur = (
        e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { value } = e.target;
        if (formatFunction) {
            setLocalFilters((prevFilters) => ({
                ...prevFilters,
                [param]: formatFunction(value),
            }));
        }
    };

    return (
        <TextField
            label={label}
            value={value}
            onChange={handleInputChange}
            slotProps={{
                input: {
                    endAdornment: endAdornment ? (
                        <InputAdornment position="end">
                            {endAdornment}
                        </InputAdornment>
                    ) : undefined,
                },
                htmlInput: {
                    inputMode: "decimal",
                    pattern: "[0-9]*\\.?[0-9]{0,2}",
                },
            }}
            onBlur={handleBlur}
            sx={style}
            size="small"
        />
    );
};
export default DecimalField;
