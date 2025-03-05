import { Grid2 as Grid, InputAdornment, TextField } from "@mui/material";
import React, { SetStateAction } from "react";
import { useEffect } from "react";
import { inputStyle, readOnlyStyle } from "../../productInputStyles";

interface ProductDimensionsFormProps {
    weight: string;
    setWeight: React.Dispatch<React.SetStateAction<string>>;
    height: string;
    setHeight: React.Dispatch<React.SetStateAction<string>>;
    width: string;
    setWidth: React.Dispatch<React.SetStateAction<string>>;
    depth: string;
    setDepth: React.Dispatch<React.SetStateAction<string>>;
    editMode: boolean;
    handleDecimalInput: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        setAction: React.Dispatch<SetStateAction<string>>
    ) => void;
    handleDecimalBlur: (
        event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
        setAction: React.Dispatch<SetStateAction<string>>
    ) => void;
}
const ProductDimensionsForm: React.FC<ProductDimensionsFormProps> = ({
    weight,
    setWeight,
    height,
    setHeight,
    width,
    setWidth,
    depth,
    setDepth,
    editMode,
    handleDecimalInput,
    handleDecimalBlur,
}) => {
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
                <TextField
                    fullWidth
                    variant={editMode ? "filled" : "standard"}
                    id="height"
                    label="Height"
                    required={editMode ? true : false}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    in.
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
                    sx={editMode ? inputStyle : readOnlyStyle}
                    value={height}
                    onChange={(e) => handleDecimalInput(e, setHeight)}
                    onBlur={(e) => handleDecimalBlur(e, setHeight)}
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
                <TextField
                    fullWidth
                    variant={editMode ? "filled" : "standard"}
                    id="width"
                    label="Width"
                    required={editMode ? true : false}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    in.
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
                    sx={editMode ? inputStyle : readOnlyStyle}
                    value={width}
                    onChange={(e) => handleDecimalInput(e, setWidth)}
                    onBlur={(e) => handleDecimalBlur(e, setWidth)}
                />
            </Grid>
            <Grid
                sx={{
                    paddingRight: "12px",
                    paddingLeft: { lg: "24px" },
                }}
                size={{
                    xs: 6,
                    lg: 3,
                }}
            >
                <TextField
                    fullWidth
                    variant={editMode ? "filled" : "standard"}
                    id="depth"
                    label="Depth"
                    required={editMode ? true : false}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    in.
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
                    sx={editMode ? inputStyle : readOnlyStyle}
                    value={depth}
                    onChange={(e) => handleDecimalInput(e, setDepth)}
                    onBlur={(e) => handleDecimalBlur(e, setDepth)}
                />
            </Grid>
            <Grid
                sx={{ paddingLeft: { xs: "12px", lg: "36px" } }}
                size={{
                    xs: 6,
                    lg: 3,
                }}
            >
                <TextField
                    fullWidth
                    variant={editMode ? "filled" : "standard"}
                    id="weight"
                    label="Weight"
                    required={editMode ? true : false}
                    slotProps={{
                        input: {
                            endAdornment: (
                                <InputAdornment position="end">
                                    lbs.
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
                    sx={editMode ? inputStyle : readOnlyStyle}
                    value={weight}
                    onChange={(e) => handleDecimalInput(e, setWeight)}
                    onBlur={(e) => handleDecimalBlur(e, setWeight)}
                />
            </Grid>
        </React.Fragment>
    );
};
export default ProductDimensionsForm;
