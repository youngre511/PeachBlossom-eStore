import { Grid2 as Grid, InputAdornment, TextField } from "@mui/material";
import React, { SetStateAction } from "react";
import { SelectFieldNonFormik } from "../../../../../common/components/Fields/SelectFieldNonFormik";
import { colorOptions, materialOptions } from "../utils/avProductUtils";
import {
    adminFormInputStyle,
    adminReadOnlyStyle,
} from "../../../../constants/formInputStyles";

interface ProductInfoFormProps {
    productName: string;
    setProductName: React.Dispatch<React.SetStateAction<string>>;
    productNo: string | null;
    price: string;
    setPrice: React.Dispatch<React.SetStateAction<string>>;
    handleDecimalInput: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        setAction: React.Dispatch<SetStateAction<string>>
    ) => void;
    handleDecimalBlur: (
        event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
        setAction: React.Dispatch<SetStateAction<string>>
    ) => void;
    category: string;
    setCategory: React.Dispatch<React.SetStateAction<string>>;
    subcategory: string;
    setSubcategory: React.Dispatch<React.SetStateAction<string>>;
    categoryOptions: string[];
    subcategories: string[] | "disabled";
    color: string;
    setColor: React.Dispatch<React.SetStateAction<string>>;
    materials: string[];
    setMaterials: React.Dispatch<React.SetStateAction<string[]>>;
    editMode: boolean;
}
const ProductInfoForm: React.FC<ProductInfoFormProps> = ({
    productName,
    setProductName,
    productNo,
    price,
    setPrice,
    handleDecimalInput,
    handleDecimalBlur,
    category,
    setCategory,
    subcategory,
    setSubcategory,
    categoryOptions,
    subcategories,
    color,
    setColor,
    materials,
    setMaterials,
    editMode,
}) => {
    return (
        <React.Fragment>
            <TextField
                fullWidth
                variant={editMode ? "filled" : "standard"}
                id="name"
                label="ProductName"
                required={editMode ? true : false}
                slotProps={{
                    htmlInput: {
                        sx: editMode ? { backgroundColor: "white" } : undefined,
                        readOnly: editMode ? false : true,
                    },
                }}
                sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
            />

            <Grid
                columnSpacing={3}
                sx={{ display: "flex", flexWrap: "wrap" }}
                container
                size={12}
            >
                <Grid size={6}>
                    <TextField
                        fullWidth
                        variant={editMode ? "filled" : "standard"}
                        id="productNo"
                        label="Product Number"
                        required={false}
                        slotProps={{
                            htmlInput: {
                                sx: editMode
                                    ? { backgroundColor: "white" }
                                    : undefined,
                                readOnly: true,
                            },
                        }}
                        sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
                        value={productNo}
                    />
                </Grid>
                <Grid size={6}>
                    <TextField
                        fullWidth
                        variant={editMode ? "filled" : "standard"}
                        id="price"
                        label="Price"
                        required={editMode ? true : false}
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
                        value={price}
                        onChange={(e) => handleDecimalInput(e, setPrice)}
                        onBlur={(e) => handleDecimalBlur(e, setPrice)}
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
                        sm: 6,
                    }}
                >
                    <SelectFieldNonFormik
                        label="Category"
                        name="category"
                        multiple={false}
                        required={editMode ? true : false}
                        readOnly={editMode ? false : true}
                        options={categoryOptions}
                        sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
                        value={category}
                        setAction={setCategory}
                        variant={editMode ? "filled" : "standard"}
                    />
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                    }}
                >
                    <SelectFieldNonFormik
                        label="Subcategory"
                        name="subcategory"
                        multiple={false}
                        required={false}
                        options={subcategories}
                        readOnly={editMode ? false : true}
                        sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
                        value={
                            subcategories !== "disabled" && subcategory
                                ? subcategory
                                : ""
                        }
                        setAction={setSubcategory}
                        variant={editMode ? "filled" : "standard"}
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
                        sm: 6,
                    }}
                >
                    <SelectFieldNonFormik
                        label="Color"
                        name="color"
                        readOnly={editMode ? false : true}
                        multiple={false}
                        required={editMode ? true : false}
                        options={colorOptions}
                        sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
                        setAction={setColor}
                        value={color}
                        variant={editMode ? "filled" : "standard"}
                    />
                </Grid>
                <Grid
                    size={{
                        xs: 12,
                        sm: 6,
                    }}
                >
                    <SelectFieldNonFormik
                        label="Material"
                        name="material"
                        readOnly={editMode ? false : true}
                        multiple={true}
                        required={editMode ? true : false}
                        options={materialOptions}
                        sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
                        setMultipleAction={setMaterials}
                        value={materials}
                        variant={editMode ? "filled" : "standard"}
                    />
                </Grid>
            </Grid>
        </React.Fragment>
    );
};
export default ProductInfoForm;
