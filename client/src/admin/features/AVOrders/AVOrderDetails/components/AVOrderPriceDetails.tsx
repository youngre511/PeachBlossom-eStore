import { Grid2 as Grid, InputAdornment, TextField } from "@mui/material";
import React, { SetStateAction } from "react";
import {
    adminFormInputStyle,
    adminReadOnlyStyle,
} from "../../../../constants/formInputStyles";

interface AVOrderPriceDetailsProps {
    editMode: boolean;
    subTotal: string;
    shipping: string;
    handleShippingInput: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        setAction: React.Dispatch<SetStateAction<string>>
    ) => void;
    handleShippingBlur: (
        event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
        setAction: React.Dispatch<SetStateAction<string>>
    ) => void;
    setShipping: React.Dispatch<SetStateAction<string>>;
    tax: string;
    total: string;
}
const AVOrderPriceDetails: React.FC<AVOrderPriceDetailsProps> = ({
    editMode,
    subTotal,
    shipping,
    handleShippingInput,
    handleShippingBlur,
    setShipping,
    tax,
    total,
}) => {
    return (
        <Grid
            spacing={3}
            container
            size={{
                xs: 12,
                lg: 3,
            }}
        >
            <Grid size={12}>
                <TextField
                    fullWidth
                    variant={editMode ? "filled" : "standard"}
                    id="subtotal"
                    label="Subtotal"
                    required={false}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    $
                                </InputAdornment>
                            ),
                        },

                        htmlInput: {
                            pattern: "^d*.?d{0,2}$",
                            inputMode: "decimal",
                            sx: editMode
                                ? {
                                      backgroundColor: "white !important",
                                  }
                                : undefined,
                            readOnly: true,
                        },
                    }}
                    sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
                    value={subTotal}
                />
            </Grid>
            <Grid size={12}>
                <TextField
                    fullWidth
                    variant={editMode ? "filled" : "standard"}
                    id="shippingCost"
                    label="Shipping"
                    required={editMode}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    $
                                </InputAdornment>
                            ),
                        },
                        htmlInput: {
                            pattern: "^d*.?d{0,2}$",
                            inputMode: "decimal",
                            sx: editMode
                                ? {
                                      backgroundColor: "white !important",
                                  }
                                : undefined,
                            readOnly: editMode ? false : true,
                        },
                    }}
                    sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
                    value={subTotal !== "0.00" ? shipping : "0.00"}
                    onChange={(e) => handleShippingInput(e, setShipping)}
                    onBlur={(e) => handleShippingBlur(e, setShipping)}
                />
            </Grid>
            <Grid size={12}>
                <TextField
                    fullWidth
                    variant={editMode ? "filled" : "standard"}
                    id="tax"
                    label="Tax"
                    required={false}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    $
                                </InputAdornment>
                            ),
                        },
                        htmlInput: {
                            pattern: "^d*.?d{0,2}$",
                            inputMode: "decimal",
                            sx: editMode
                                ? {
                                      backgroundColor: "white !important",
                                  }
                                : undefined,
                            readOnly: true,
                        },
                    }}
                    sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
                    value={subTotal !== "0.00" ? tax : "0.00"}
                />
            </Grid>
            <Grid size={12}>
                <TextField
                    fullWidth
                    variant={editMode ? "filled" : "standard"}
                    id="total"
                    label="Total"
                    required={false}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    $
                                </InputAdornment>
                            ),
                        },
                        htmlInput: {
                            pattern: "^d*.?d{0,2}$",
                            inputMode: "decimal",
                            sx: editMode
                                ? {
                                      backgroundColor: "white !important",
                                  }
                                : undefined,
                            readOnly: true,
                        },
                    }}
                    sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
                    value={subTotal !== "0.00" ? total : "0.00"}
                />
            </Grid>
        </Grid>
    );
};
export default AVOrderPriceDetails;
