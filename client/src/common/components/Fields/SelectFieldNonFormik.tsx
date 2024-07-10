import React, { ComponentProps, SetStateAction } from "react";
import {
    InputLabel,
    Select,
    TextField,
    Box,
    MenuItem,
    Checkbox,
    ListItemText,
} from "@mui/material";

export type SelectFieldProps = {
    label: string;
    name: string;
    multiple: boolean;
    options: string[] | "disabled";
    required: boolean;
    sx?: ComponentProps<typeof TextField>["sx"];
    setAction?: React.Dispatch<SetStateAction<string>>;
    setMultipleAction?: React.Dispatch<SetStateAction<string[]>>;
    value: string[] | string;
    readOnly: boolean;
    variant: "filled" | "outlined" | "standard" | undefined;
};

const itemHeight = 48;
const itemPaddingTop = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: itemHeight * 4.5 + itemPaddingTop,
            width: 250,
        },
    },
};

export const SelectFieldNonFormik: React.FC<SelectFieldProps> = ({
    label,
    name,
    multiple,
    options,
    required,
    sx,
    setAction,
    setMultipleAction,
    value,
    readOnly,
    variant,
}) => {
    return (
        <Box>
            <InputLabel id={`${name}=label`} required={required}>
                {label}
            </InputLabel>
            <Select
                fullWidth
                labelId={`${name}-label`}
                variant={variant}
                multiple={multiple}
                id={name}
                // disableUnderline={variant === "standard" ? true : false}
                placeholder={options === "disabled" ? "N/A" : undefined}
                label={label}
                disabled={options === "disabled"}
                required={required}
                renderValue={(selected) =>
                    multiple ? (selected as string[]).join(", ") : selected
                }
                sx={sx}
                MenuProps={MenuProps}
                value={value}
                onChange={(e) => {
                    if (Array.isArray(e.target.value) && setMultipleAction) {
                        setMultipleAction(e.target.value);
                    }
                    if (!Array.isArray(e.target.value) && setAction) {
                        setAction(e.target.value);
                    }
                }}
                inputProps={{ readOnly: readOnly }}
            >
                {Array.isArray(options) &&
                    options.map((option: string) => (
                        <MenuItem value={option} key={option}>
                            {multiple && (
                                <Checkbox
                                    checked={
                                        (value as string[]).indexOf(option) > -1
                                    }
                                />
                            )}
                            <ListItemText primary={option} />
                        </MenuItem>
                    ))}
            </Select>
        </Box>
    );
};
