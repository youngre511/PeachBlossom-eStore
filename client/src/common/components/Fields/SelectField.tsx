import React, { ComponentProps, useEffect } from "react";
import {
    InputLabel,
    Select,
    TextField,
    Box,
    MenuItem,
    Checkbox,
    ListItemText,
} from "@mui/material";
import { useField } from "formik";

export type SelectFieldProps = {
    label: string;
    name: string;
    multiple: boolean;
    options: string[] | "disabled";
    required: boolean;
    sx?: ComponentProps<typeof TextField>["sx"];
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

// FormField is  a simple wrapper around MaterialUI's TextField that
// hooks into Formik.
export const SelectField: React.FC<SelectFieldProps> = ({
    label,
    name,
    multiple,
    options,
    required,
    sx,
}) => {
    const [field, meta, helpers] = useField(name);
    const { setValue } = helpers;
    const errorText = "";

    useEffect(() => {
        setValue(options === "disabled" ? "" : multiple === true ? [] : "");
    }, [options]);

    return (
        <Box>
            <InputLabel id={`${name}=label`} required={required}>
                {label}
            </InputLabel>
            <Select
                fullWidth
                labelId={`${name}-label`}
                variant="filled"
                multiple={multiple}
                id={name}
                placeholder={options === "disabled" ? "N/A" : undefined}
                label={label}
                disabled={options === "disabled"}
                error={meta.touched && Boolean(meta.error)}
                required={required}
                renderValue={(selected) =>
                    multiple ? (selected as string[]).join(", ") : selected
                }
                sx={sx}
                MenuProps={MenuProps}
                {...field}
            >
                {Array.isArray(options) &&
                    options.map((option: string) => (
                        <MenuItem value={option} key={option}>
                            {multiple && (
                                <Checkbox
                                    checked={
                                        (field.value as string[]).indexOf(
                                            option
                                        ) > -1
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
