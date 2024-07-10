import React, {
    ComponentProps,
    useState,
    useEffect,
    useCallback,
    useMemo,
    SetStateAction,
} from "react";
import {
    Grid,
    Container,
    InputAdornment,
    Paper,
    TextField,
    Box,
    Button,
    Typography,
} from "@mui/material";

import axios, { AxiosError } from "axios";
import "./av-product-details.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import ImageUploader from "../ImageUploader/ImageUploader";
import { ImageListType } from "react-images-uploading";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/store";
import { avFetchCategories } from "../../features/AVMenuData/avMenuDataSlice";
import { AVCategory } from "../../features/AVMenuData/avMenuDataTypes";
import { SelectFieldNonFormik } from "../../../common/components/Fields/SelectFieldNonFormik";

///////////////////
///////TYPES///////
///////////////////
type Submission = {
    name: string;
    prefix: string;
    price: number;
    category: string;
    subcategory: string;
    color: string;
    material: string[];
    width: string;
    height: string;
    depth: string;
    weight: string;
    description: string;
};

export interface ApiResponse<T> {
    message: string;
    payload: T;
}
export type FetchCategoriesResponse = ApiResponse<Category[]>;

export interface Category {
    name: string;
    subCategories: string[];
}

interface OneProduct {
    name: string;
    productNo: string;
    category: string;
    subcategory: string | null;
    description: string;
    attributes: {
        color: string;
        material: string[];
        weight: number;
        dimensions: {
            width: number;
            height: number;
            depth: number;
        };
    };
    price: number;
    images: string[];
    tags: string[] | null;
}

///////////////////////
///////Constants///////
///////////////////////

const colorOptions = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
    "gold",
    "silver",
    "white",
    "gray",
    "black",
    "brown",
    "cream",
    "beige",
    "multicolor",
    "clear",
];
const materialOptions = [
    "glass",
    "plastic",
    "ceramic",
    "metal",
    "wood",
    "fabric",
    "leather",
    "stone",
    "rubber",
    "resin",
    "natural fiber",
    "bamboo",
];

/////////////////////////
///////FIELD STYLE///////
/////////////////////////

export const inputStyle = {
    // backgroundColor: "white",
    "&.MuiFilledInput-root": {
        borderRadius: 0,
        backgroundColor: "white",
        "&.Mui-disabled": {
            backgroundColor: "peach.light",
        },
    },
    "&.MuiFilledInput-input": {
        backgroundColor: "white",
    },
    "&.MuiInputBase-root": {
        backgroundColor: "white",
        "&.MuiFilledInput-root": {
            backgroundColor: "white",
            "&.Mui-disabled": {
                backgroundColor: "peach.light",
            },
        },
    },
    "& .MuiInputBase-input.MuiFilledInput-input:focus": {
        backgroundColor: "white",
    },
    "& .MuiInputBase-root.MuiFilledInput-root.MuiFilledInput-underline.MuiInputBase-adornedStart":
        {
            backgroundColor: "white",
        },
    "& .MuiInputBase-root.MuiFilledInput-root.MuiFilledInput-underline.MuiInputBase-adornedEnd":
        {
            backgroundColor: "white",
        },
    "& .MuiInputBase-root.MuiFilledInput-root": {
        backgroundColor: "white",
    },
};

export const readOnlyStyle = {
    "& .MuiInputBase-root.MuiInput-root": {
        marginTop: 0,
    },
    "& .MuiInputLabel-root": {
        transform: "translate(12px, 7px) scale(0.75)",
    },
    "& .MuiInputBase-input": {
        padding: "25px 12px 8px 12px",
    },
    "& .MuiInputBase-root:before": {
        borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
    },
    "& .MuiInputLabel-root.Mui-focused": {
        color: "rgba(0, 0, 0, 0.6)",
    },
    "& .MuiInputBase-root:hover:not(.Mui-disabled):before": {
        borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
    },
    "& .MuiSelect-root:hover:before": {
        borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
    },
    "& .MuiInputBase-root:after": {
        borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
    },
    "& .MuiInput-underline:after": {
        borderBottom: "none",
    },
    "& .MuiSelect-icon": {
        display: "none",
    },
    "&:hover:not(.Mui-disabled):before": {
        borderBottom: "1px solid rgba(0, 0, 0, 0.42)",
    },
    "&:after": {
        border: "none",
    },
};

////////////////////////////
///////MAIN COMPONENT///////
////////////////////////////

const AVProductDetails: React.FC = () => {
    const categories = useAppSelector(
        (state: RootState) => state.avMenuData.categories
    );
    const [subCategories, setSubCategories] = useState<string[] | "disabled">(
        "disabled"
    );
    const [images, setImages] = useState<ImageListType>([]);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const productNo = searchParams.get("product");
    const editMode = searchParams.get("editing") === "true" ? true : false;

    const [currentDetails, setCurrentDetails] = useState<OneProduct | null>(
        null
    );
    const [productName, setProductName] = useState<string>("");
    const [price, setPrice] = useState<string>("");
    const [category, setCategory] = useState<string>("");
    const [subcategory, setSubcategory] = useState<string>("");
    const [weight, setWeight] = useState<string>("");
    const [height, setHeight] = useState<string>("");
    const [width, setWidth] = useState<string>("");
    const [depth, setDepth] = useState<string>("");
    const [color, setColor] = useState<string>("");
    const [materials, setMaterials] = useState<string[]>([]);
    const [description, setDescription] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);

    console.log("just before use effect");
    useEffect(() => {
        console.log("using effect");
        const getProductDetails = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}product/${productNo}`
                );
                const productDetails: OneProduct = response.data.payload;
                setCurrentDetails(productDetails);
                setProductName(productDetails.name);
                setPrice(String(productDetails.price.toFixed(2)));
                setCategory(productDetails.category);
                setSubcategory(productDetails.subcategory || "");
                setWeight(String(productDetails.attributes.weight));
                setColor(productDetails.attributes.color);
                setMaterials(productDetails.attributes.material);
                setDescription(productDetails.description);
                setHeight(
                    String(
                        productDetails.attributes.dimensions.height.toFixed(2)
                    )
                );
                setWidth(
                    String(
                        productDetails.attributes.dimensions.width.toFixed(2)
                    )
                );
                setDepth(
                    String(
                        productDetails.attributes.dimensions.depth.toFixed(2)
                    )
                );
                setLoading(false);
                console.log("got product details:", productDetails);
            } catch (error) {
                if (error instanceof AxiosError) {
                    console.error("Error fetching product details", error);
                } else {
                    console.error(
                        "An unknown error has ocurred while fetching product details"
                    );
                }
            }
        };

        getProductDetails();
    }, []);

    const handleDecimalInput = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        setAction: React.Dispatch<SetStateAction<string>>
    ) => {
        const regex = new RegExp("^d*.?d{0,2}$");
        const { value } = event.currentTarget;
        if (regex.test(value) || value === "") {
            event.currentTarget.value = value;
            setAction(value);
        } else {
            event.currentTarget.value = value.slice(0, -1);
        }
    };

    const handleDecimalBlur = (
        event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
        setAction: React.Dispatch<SetStateAction<string>>
    ) => {
        const { value } = event.currentTarget;
        const newValue =
            Number(value) > 0 ? String(Number(value).toFixed(2)) : "";
        setAction(newValue);
        event.currentTarget.value = newValue;
    };

    useEffect(() => {
        if (category) {
            const selectedCategory = categories.find(
                (cat) => cat.name === category
            );
            if (selectedCategory && selectedCategory.subCategories.length > 0) {
                setSubCategories(selectedCategory.subCategories);
            } else {
                setSubCategories("disabled");
            }
        }
    }, [category, categories]);

    // const handleSubmit = async (
    //     values: Submission,
    //     actions: FormikHelpers<Submission>
    // ) => {
    //     actions.setSubmitting(true);
    //     console.log("starting submit process");
    //     const formData = new FormData();
    //     formData.append("name", values.name);
    //     formData.append("category", values.category);
    //     if (values.subcategory) {
    //         formData.append("subCategory", values.subcategory);
    //     }
    //     formData.append("prefix", values.prefix.toLowerCase());
    //     formData.append("description", values.description);
    //     formData.append(
    //         "attributes",
    //         JSON.stringify({
    //             color: values.color,
    //             material: values.material,
    //             weight: values.weight,
    //             dimensions: {
    //                 width: values.width,
    //                 height: values.height,
    //                 depth: values.depth,
    //             },
    //         })
    //     );
    //     formData.append("price", values.price.toString());
    //     images.forEach((image, index) => {
    //         const newFileName = `${values.name
    //             .replace(/\s+/g, "_")
    //             .toLowerCase()}_${index + 1}`;
    //         formData.append("images", image.file as File, newFileName);
    //     });

    //     try {
    //         const response = await axios.post(
    //             `${process.env.REACT_APP_API_URL}product/create`,
    //             formData,
    //             {
    //                 headers: {
    //                     "Content-Type": "multipart/form-data",
    //                 },
    //             }
    //         );
    //         console.log("Response:", response.data);
    //     } catch (error) {
    //         console.error("Error uploading files:", error);
    //     } finally {
    //         actions.setSubmitting(false);
    //         navigate("/products/manage");
    //     }
    // };

    //////////////////////////////

    useEffect(() => {
        if (!categories) dispatch(avFetchCategories());
    }, []);

    const categoryOptions = useMemo(
        () => categories.map((category) => category.name),
        [categories]
    );

    return (
        <Container>
            <h1>Product Details</h1>
            <Grid container spacing={3} mt={3} sx={{ width: "100%" }}>
                <Grid
                    item
                    xs={12}
                    lg={5}
                    sx={{
                        paddingTop: "0 !important",
                        alignItems: "stretch",
                        alignSelf: "stretch",
                        display: "flex",
                        justifyContent: {
                            xs: "center",
                            lg: "flex-start",
                        },
                        marginBottom: {
                            xs: 3,
                            lg: 0,
                        },
                    }}
                >
                    <ImageUploader setImages={setImages} images={images} />
                </Grid>
                <Grid
                    container
                    item
                    xs={12}
                    lg={7}
                    rowSpacing={3}
                    sx={{ alignItems: "space-between", height: "auto" }}
                >
                    <TextField
                        fullWidth
                        variant={editMode ? "filled" : "standard"}
                        id="name"
                        label="ProductName"
                        required={editMode ? true : false}
                        inputProps={{
                            sx: editMode
                                ? { backgroundColor: "white" }
                                : undefined,
                            readOnly: editMode ? false : true,
                        }}
                        sx={editMode ? inputStyle : readOnlyStyle}
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                    />

                    <Grid
                        columnSpacing={3}
                        sx={{ display: "flex", flexWrap: "wrap" }}
                        item
                        container
                        xs={12}
                    >
                        <Grid item sm={6}>
                            <TextField
                                fullWidth
                                variant={editMode ? "filled" : "standard"}
                                id="productNo"
                                label="Product Number"
                                required={false}
                                inputProps={{
                                    sx: editMode
                                        ? { backgroundColor: "white" }
                                        : undefined,
                                    readOnly: true,
                                }}
                                sx={editMode ? inputStyle : readOnlyStyle}
                                value={productNo}
                            />
                        </Grid>
                        <Grid item sm={6}>
                            <TextField
                                fullWidth
                                variant={editMode ? "filled" : "standard"}
                                id="price"
                                label="Price"
                                required={editMode ? true : false}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            $
                                        </InputAdornment>
                                    ),
                                }}
                                inputProps={{
                                    pattern: "^d*.?d{0,2}$",
                                    inputMode: "decimal",
                                    sx: editMode
                                        ? {
                                              backgroundColor:
                                                  "white !important",
                                          }
                                        : undefined,
                                    readOnly: editMode ? false : true,
                                }}
                                sx={editMode ? inputStyle : readOnlyStyle}
                                value={price}
                                onChange={(e) =>
                                    handleDecimalInput(e, setPrice)
                                }
                                onBlur={(e) => handleDecimalBlur(e, setPrice)}
                            />
                        </Grid>
                    </Grid>
                    <Grid
                        columnSpacing={3}
                        sx={{ display: "flex", flexWrap: "wrap" }}
                        item
                        xs={12}
                        container
                    >
                        <Grid item sm={6}>
                            <SelectFieldNonFormik
                                label="Category"
                                name="category"
                                multiple={false}
                                required={false}
                                readOnly={editMode ? false : true}
                                options={categoryOptions}
                                sx={editMode ? inputStyle : readOnlyStyle}
                                value={category}
                                setAction={setCategory}
                                variant={editMode ? "filled" : "standard"}
                            />
                        </Grid>
                        <Grid item sm={6}>
                            <SelectFieldNonFormik
                                label="Subcategory"
                                name="subcategory"
                                multiple={false}
                                required={false}
                                options={subCategories}
                                readOnly={editMode ? false : true}
                                sx={editMode ? inputStyle : readOnlyStyle}
                                value={
                                    subCategories !== "disabled" && subcategory
                                        ? subcategory
                                        : ""
                                }
                                setAction={setSubcategory}
                                variant={editMode ? "filled" : "standard"}
                            />
                        </Grid>
                    </Grid>
                    <Grid
                        columnSpacing={3}
                        sx={{ display: "flex", flexWrap: "wrap" }}
                        item
                        xs={12}
                        container
                    >
                        <Grid item sm={6}>
                            <SelectFieldNonFormik
                                label="Color"
                                name="color"
                                readOnly={editMode ? false : true}
                                multiple={false}
                                required={editMode ? true : false}
                                options={colorOptions}
                                sx={editMode ? inputStyle : readOnlyStyle}
                                setAction={setColor}
                                value={color}
                                variant={editMode ? "filled" : "standard"}
                            />
                        </Grid>
                        <Grid item sm={6}>
                            <SelectFieldNonFormik
                                label="Material"
                                name="material"
                                readOnly={editMode ? false : true}
                                multiple={true}
                                required={editMode ? true : false}
                                options={materialOptions}
                                sx={editMode ? inputStyle : readOnlyStyle}
                                setMultipleAction={setMaterials}
                                value={materials}
                                variant={editMode ? "filled" : "standard"}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid
                    container
                    item
                    xs={12}
                    columnSpacing={{ xs: 3, md: 6 }}
                    rowSpacing={3}
                >
                    <Grid item xs={6} md={3}>
                        <TextField
                            fullWidth
                            variant={editMode ? "filled" : "standard"}
                            id="height"
                            label="Height"
                            required={editMode ? true : false}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        in.
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{
                                pattern: "^d*.?d{0,2}$",
                                inputMode: "decimal",
                                sx: editMode
                                    ? {
                                          backgroundColor: "white !important",
                                      }
                                    : undefined,
                                readOnly: editMode ? false : true,
                            }}
                            sx={editMode ? inputStyle : readOnlyStyle}
                            value={height}
                            onChange={(e) => handleDecimalInput(e, setHeight)}
                            onBlur={(e) => handleDecimalBlur(e, setHeight)}
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <TextField
                            fullWidth
                            variant={editMode ? "filled" : "standard"}
                            id="width"
                            label="Width"
                            required={editMode ? true : false}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        in.
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{
                                pattern: "^d*.?d{0,2}$",
                                inputMode: "decimal",
                                sx: editMode
                                    ? {
                                          backgroundColor: "white !important",
                                      }
                                    : undefined,
                                readOnly: editMode ? false : true,
                            }}
                            sx={editMode ? inputStyle : readOnlyStyle}
                            value={width}
                            onChange={(e) => handleDecimalInput(e, setWidth)}
                            onBlur={(e) => handleDecimalBlur(e, setWidth)}
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <TextField
                            fullWidth
                            variant={editMode ? "filled" : "standard"}
                            id="depth"
                            label="Depth"
                            required={editMode ? true : false}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        in.
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{
                                pattern: "^d*.?d{0,2}$",
                                inputMode: "decimal",
                                sx: editMode
                                    ? {
                                          backgroundColor: "white !important",
                                      }
                                    : undefined,
                                readOnly: editMode ? false : true,
                            }}
                            sx={editMode ? inputStyle : readOnlyStyle}
                            value={depth}
                            onChange={(e) => handleDecimalInput(e, setDepth)}
                            onBlur={(e) => handleDecimalBlur(e, setDepth)}
                        />
                    </Grid>
                    <Grid item xs={6} md={3}>
                        <TextField
                            fullWidth
                            variant={editMode ? "filled" : "standard"}
                            id="weight"
                            label="Weight"
                            required={editMode ? true : false}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        lbs.
                                    </InputAdornment>
                                ),
                            }}
                            inputProps={{
                                pattern: "^d*.?d{0,2}$",
                                inputMode: "decimal",
                                sx: editMode
                                    ? {
                                          backgroundColor: "white !important",
                                      }
                                    : undefined,
                                readOnly: editMode ? false : true,
                            }}
                            sx={editMode ? inputStyle : readOnlyStyle}
                            value={weight}
                            onChange={(e) => handleDecimalInput(e, setWeight)}
                            onBlur={(e) => handleDecimalBlur(e, setWeight)}
                        />
                    </Grid>
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        fullWidth
                        variant={editMode ? "filled" : "standard"}
                        id="description"
                        label="Description"
                        multiline={true}
                        rows={5}
                        required={editMode ? true : false}
                        inputProps={{
                            sx: editMode
                                ? {
                                      backgroundColor: "white !important",
                                  }
                                : undefined,
                            readOnly: editMode ? false : true,
                        }}
                        sx={editMode ? inputStyle : readOnlyStyle}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </Grid>
                <Grid
                    item
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                    }}
                >
                    <Button
                        variant="outlined"
                        href="/products/manage"
                        sx={{ color: "black" }}
                    >
                        &lt; Back to product management
                    </Button>
                    {editMode ? (
                        <Button
                            variant="contained"
                            onClick={() => {
                                searchParams.delete("editing");
                                setSearchParams(searchParams);
                            }}
                        >
                            Cancel
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            onClick={() => {
                                searchParams.set("editing", "true");
                                setSearchParams(searchParams);
                            }}
                        >
                            Edit
                        </Button>
                    )}
                </Grid>
            </Grid>
        </Container>
    );
};
export default AVProductDetails;
