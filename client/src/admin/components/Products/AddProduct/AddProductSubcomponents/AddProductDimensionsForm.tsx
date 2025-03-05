import React from "react";
import { useEffect } from "react";
import { FormField } from "../../../../../common/components/Fields/FormField";
import { inputStyle } from "../../productInputStyles";
import { Grid2 as Grid, InputAdornment } from "@mui/material";

interface AddProductDimensionsFormProps {}
const AddProductDimensionsForm: React.FC<
    AddProductDimensionsFormProps
> = () => {
    return (
        <React.Fragment>
            <Grid
                sx={{
                    paddingRight: { xs: "12px", lg: "36px" },
                }}
                size={{
                    xs: 6,
                    lg: 3,
                }}
            >
                <FormField
                    label="Height"
                    name="height"
                    required={true}
                    pattern="^\d*\.?\d{0,2}$"
                    inputMode="decimal"
                    sx={inputStyle}
                    inputSx={{
                        backgroundColor: "white !important",
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment
                                position="end"
                                sx={{
                                    backgroundColor: "white",
                                    "&.MuiInputAdornment-root": {
                                        backgroundColor: "white !important",
                                    },
                                }}
                                style={{
                                    backgroundColor: "white !important",
                                }}
                            >
                                in.
                            </InputAdornment>
                        ),
                    }}
                />
            </Grid>
            <Grid
                sx={{
                    paddingLeft: { xs: "12px", lg: "12px" },
                    paddingRight: { lg: "24px" },
                }}
                size={{
                    xs: 6,
                    lg: 3,
                }}
            >
                <FormField
                    label="Width"
                    name="width"
                    required={true}
                    pattern="^\d*\.?\d{0,2}$"
                    inputMode="decimal"
                    sx={inputStyle}
                    inputSx={{
                        backgroundColor: "white !important",
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment
                                position="end"
                                sx={{
                                    backgroundColor: "white",
                                    "&.MuiInputAdornment-root": {
                                        backgroundColor: "white !important",
                                    },
                                }}
                                style={{
                                    backgroundColor: "white !important",
                                }}
                            >
                                in.
                            </InputAdornment>
                        ),
                    }}
                />
            </Grid>
            <Grid
                sx={{
                    paddingLeft: { lg: "24px" },
                    paddingRight: "12px",
                }}
                size={{
                    xs: 6,
                    lg: 3,
                }}
            >
                <FormField
                    label="Depth"
                    name="depth"
                    required={true}
                    pattern="^\d*\.?\d{0,2}$"
                    inputMode="decimal"
                    sx={inputStyle}
                    inputSx={{
                        backgroundColor: "white !important",
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment
                                position="end"
                                sx={{
                                    backgroundColor: "white",
                                    "&.MuiInputAdornment-root": {
                                        backgroundColor: "white !important",
                                    },
                                }}
                                style={{
                                    backgroundColor: "white !important",
                                }}
                            >
                                in.
                            </InputAdornment>
                        ),
                    }}
                />
            </Grid>
            <Grid
                sx={{ paddingLeft: { xs: "12px", lg: "36px" } }}
                size={{
                    xs: 6,
                    lg: 3,
                }}
            >
                <FormField
                    label="Weight"
                    name="weight"
                    required={true}
                    pattern="^\d*\.?\d{0,2}$"
                    inputMode="decimal"
                    sx={inputStyle}
                    inputSx={{
                        backgroundColor: "white !important",
                    }}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment
                                position="end"
                                sx={{
                                    backgroundColor: "white",
                                    "&.MuiInputAdornment-root": {
                                        backgroundColor: "white !important",
                                    },
                                }}
                                style={{
                                    backgroundColor: "white !important",
                                }}
                            >
                                lbs.
                            </InputAdornment>
                        ),
                    }}
                />
            </Grid>
        </React.Fragment>
    );
};
export default AddProductDimensionsForm;
