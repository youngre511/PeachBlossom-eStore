import { Grid2 as Grid, TextField } from "@mui/material";
import React, { SetStateAction } from "react";
import { useEffect } from "react";
import {
    adminFormInputStyle,
    adminReadOnlyStyle,
} from "../../../../constants/formInputStyles";
import { MuiTelInput } from "mui-tel-input";

interface AVOrderShippingDetailsProps {
    editMode: boolean;
    shippingAddress1: string;
    setShippingAddress1: React.Dispatch<SetStateAction<string>>;
    shippingAddress2: string;
    setShippingAddress2: React.Dispatch<SetStateAction<string>>;
    city: string;
    setCity: React.Dispatch<SetStateAction<string>>;
    state: string;
    setState: React.Dispatch<SetStateAction<string>>;
    zipCode: string;
    setZipCode: React.Dispatch<SetStateAction<string>>;
    email: string;
    setEmail: React.Dispatch<SetStateAction<string>>;
    emailHelperText: string;
    handleEmailBlur: (
        event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    phone: string;
    setPhone: React.Dispatch<SetStateAction<string>>;
}
const AVOrderShippingDetails: React.FC<AVOrderShippingDetailsProps> = ({
    editMode,
    shippingAddress1,
    setShippingAddress1,
    shippingAddress2,
    setShippingAddress2,
    city,
    setCity,
    state,
    setState,
    zipCode,
    setZipCode,
    email,
    setEmail,
    emailHelperText,
    handleEmailBlur,
    phone,
    setPhone,
}) => {
    const handleTelInputChange = (value: string, info: any) => {
        setPhone(value);
    };
    return (
        <Grid
            container
            rowSpacing={3}
            size={{
                xs: 12,
                lg: 8,
            }}
        >
            <Grid size={12}>
                <TextField
                    fullWidth
                    variant={editMode ? "filled" : "standard"}
                    id="shipping1"
                    label="Shipping Address 1"
                    required={editMode ? true : false}
                    slotProps={{
                        htmlInput: {
                            sx: editMode
                                ? { backgroundColor: "white" }
                                : undefined,
                            readOnly: editMode ? false : true,
                        },
                    }}
                    sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
                    value={shippingAddress1}
                    onChange={(e) => setShippingAddress1(e.target.value)}
                />
            </Grid>
            <Grid size={12}>
                <TextField
                    fullWidth
                    variant={editMode ? "filled" : "standard"}
                    id="shipping2"
                    label="Shipping Address 2"
                    required={false}
                    slotProps={{
                        htmlInput: {
                            sx: editMode
                                ? { backgroundColor: "white" }
                                : undefined,
                            readOnly: editMode ? false : true,
                        },
                    }}
                    sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
                    value={shippingAddress2}
                    onChange={(e) => setShippingAddress2(e.target.value)}
                />
            </Grid>
            <Grid spacing={3} container size={12}>
                <Grid size={5}>
                    <TextField
                        fullWidth
                        variant={editMode ? "filled" : "standard"}
                        id="city"
                        label="City"
                        required={editMode}
                        slotProps={{
                            htmlInput: {
                                sx: editMode
                                    ? {
                                          backgroundColor: "white",
                                      }
                                    : undefined,
                                readOnly: editMode ? false : true,
                            },
                        }}
                        sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                    />
                </Grid>
                <Grid size={3}>
                    <TextField
                        fullWidth
                        variant={editMode ? "filled" : "standard"}
                        id="state"
                        label="State"
                        required={editMode}
                        slotProps={{
                            htmlInput: {
                                pattern: "^[A-Za-z]{2}$",
                                sx: editMode
                                    ? {
                                          backgroundColor: "white !important",
                                      }
                                    : undefined,
                                readOnly: editMode ? false : true,
                            },
                        }}
                        sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
                        value={state}
                        onChange={(e) => setState(e.target.value.toUpperCase())}
                    />
                </Grid>
                <Grid size={4}>
                    <TextField
                        fullWidth
                        variant={editMode ? "filled" : "standard"}
                        id="zipcode"
                        label="Zip Code"
                        required={editMode}
                        slotProps={{
                            htmlInput: {
                                pattern: "^[0-9]{5}$",
                                sx: editMode
                                    ? {
                                          backgroundColor: "white !important",
                                      }
                                    : undefined,
                                readOnly: editMode ? false : true,
                            },
                        }}
                        sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                    />
                </Grid>
            </Grid>
            <Grid
                spacing={3}
                sx={{ display: "flex", flexWrap: "wrap" }}
                container
                size={12}
            >
                <Grid
                    size={{
                        xs: 12,
                        md: 6,
                    }}
                >
                    <TextField
                        fullWidth
                        variant={editMode ? "filled" : "standard"}
                        id="email"
                        label="email"
                        required={editMode}
                        slotProps={{
                            htmlInput: {
                                sx: editMode
                                    ? {
                                          backgroundColor: emailHelperText
                                              ? "#f58e90"
                                              : "white !important",
                                      }
                                    : undefined,
                                readOnly: editMode ? false : true,
                            },
                        }}
                        sx={
                            editMode
                                ? {
                                      ...adminFormInputStyle,
                                      "& .MuiFormHelperText-root": {
                                          color: "red",
                                      },
                                  }
                                : adminReadOnlyStyle
                        }
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={(e) => handleEmailBlur(e)}
                        helperText={emailHelperText ? emailHelperText : ""}
                    />
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        md: 6,
                    }}
                >
                    <MuiTelInput
                        id="phone"
                        name="phoneNumber"
                        autoComplete="tel"
                        fullWidth
                        value={phone}
                        onChange={handleTelInputChange}
                        required={editMode}
                        defaultCountry="US"
                        forceCallingCode
                        slotProps={{
                            htmlInput: {
                                readOnly: editMode ? false : true,
                            },
                        }}
                        variant={editMode ? "filled" : "standard"}
                        sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};
export default AVOrderShippingDetails;
