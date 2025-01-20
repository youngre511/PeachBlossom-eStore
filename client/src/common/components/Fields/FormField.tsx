import React, { ComponentProps, useCallback } from "react";
import { TextField } from "@mui/material";
import { useField } from "formik";

export type FormFieldProps = {
    label: string;
    name: string;
    multiline?: boolean;
    rows?: number;
    required: boolean;
    InputProps?: ComponentProps<typeof TextField>["InputProps"];
    pattern?: string;
    inputMode?:
        | "decimal"
        | "email"
        | "none"
        | "numeric"
        | "search"
        | "tel"
        | "text"
        | "url";
    sx?: ComponentProps<typeof TextField>["sx"];
    inputSx?: ComponentProps<typeof TextField>["sx"];
};

// FormField is  a simple wrapper around MaterialUI's TextField that
// hooks into Formik.
export const FormField: React.FC<FormFieldProps> = ({
    label,
    name,
    multiline,
    rows,
    required,
    InputProps,
    inputSx,
    pattern,
    inputMode,
    sx,
}) => {
    const [field, meta, helper] = useField(name);
    const value = field.value || "";
    const errorText = "";
    const { setValue, setTouched } = helper;
    const handleInput = useCallback(
        (event: React.FormEvent<HTMLInputElement>) => {
            if (pattern) {
                const regex = new RegExp(pattern);
                const { value } = event.currentTarget;
                if (regex.test(value) || value === "") {
                    event.currentTarget.value = value;
                } else {
                    console.log(value);
                    event.currentTarget.value = value.slice(0, -1);
                }
            }
        },
        [pattern]
    );

    const handleBlur = useCallback(
        (event: React.FocusEvent<HTMLInputElement>) => {
            if (inputMode && inputMode === "decimal") {
                const { value } = event.currentTarget;
                const newValue =
                    Number(value) > 0 ? String(Number(value).toFixed(2)) : "";
                setValue(newValue);
                event.currentTarget.value = newValue;
            }
            setTouched(true);
            if (field.onBlur) {
                field.onBlur(event);
            }
        },
        []
    );

    return (
        <TextField
            fullWidth
            variant="filled"
            id={name}
            label={label}
            error={meta.touched && Boolean(meta.error)}
            multiline={multiline || false}
            rows={rows || 1}
            required={required}
            slotProps={{
                input: InputProps,
                htmlInput: {
                    pattern: pattern ? pattern : undefined,
                    onInput: handleInput,
                    inputMode: inputMode ? inputMode : undefined,
                    sx: inputSx ? inputSx : undefined,
                },
            }}
            sx={sx}
            value={field.value}
            onChange={field.onChange}
            onBlur={handleBlur}
        />
    );
};
