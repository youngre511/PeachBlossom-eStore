import React, {
    useState,
    useEffect,
    useMemo,
    SetStateAction,
    useContext,
} from "react";
import {
    Grid2 as Grid,
    Container,
    InputAdornment,
    TextField,
    Box,
    Button,
} from "@mui/material";

import axios, { AxiosError } from "axios";
import "./av-product-details.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import ImageUploader from "../ImageUploader/ImageUploader";
import { ImageListType } from "react-images-uploading";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { RootState } from "../../../store/store";
import { avFetchCategories } from "../../../features/AVMenuData/avMenuDataSlice";
import { SelectFieldNonFormik } from "../../../../common/components/Fields/SelectFieldNonFormik";
import BlankPopup from "../../../../common/components/BlankPopup";
import StatusPopup from "../../../../common/components/StatusPopup";
import { AuthContext } from "../../../../common/contexts/authContext";
import { useNavigationContext } from "../../../../common/contexts/navContext";
import { axiosLogAndSetState } from "../../../../common/utils/axiosLogAndSetState";

///////////////////
///////TYPES///////
///////////////////

export interface ApiResponse<T> {
    message: string;
    payload: T;
}
export type FetchCategoriesResponse = ApiResponse<Category[]>;

export interface Category {
    name: string;
    subcategories: string[];
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
        padding: 0,
    },
    "& .MuiInputAdornment-root": {
        paddingRight: "12px",
    },
    "& .MuiInputAdornment-root.MuiInputAdornment-positionStart": {
        marginTop: "16px",
        marginRight: "-4px",
        paddingRight: 0,
        paddingLeft: "12px",
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
    const [subcategories, setSubcategories] = useState<string[] | "disabled">(
        "disabled"
    );
    const [images, setImages] = useState<ImageListType>([]);
    const [imageUrls, setImageUrls] = useState<string[]>([]);
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
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isConfirming, setIsConfirming] = useState<boolean>(false);
    const [status, setStatus] = useState<"loading" | "success" | "failure">(
        "loading"
    );
    const [error, setError] = useState<null | string>(null);
    const [mustFetchData, setMustFetchData] = useState<boolean>(true);
    const authContext = useContext(AuthContext);
    const accessLevel = authContext?.user?.accessLevel;
    const { previousRoute } = useNavigationContext();
    const [previous, setPrevious] = useState<{ path: string; name: string }>({
        path: "/products/manage",
        name: "Product Management",
    });
    const [lockedPrevious, setLockedPrevious] = useState<boolean>(false);

    useEffect(() => {
        if (
            previousRoute &&
            !lockedPrevious &&
            !previousRoute.includes("product-details")
        ) {
            if (previousRoute.includes("products/manage")) {
                setPrevious({
                    path: previousRoute,
                    name: "Product Management",
                });
            } else if (
                previousRoute.includes("dashboard") ||
                previousRoute === "/"
            ) {
                setPrevious({ path: "/sales/dashboard", name: "Dashboard" });
            } else {
                setPrevious({ path: previousRoute, name: "Previous Page" });
            }
            setLockedPrevious(true);
        }
    }, [previousRoute, lockedPrevious]);

    useEffect(() => {
        if (editMode && accessLevel === "view only") {
            searchParams.set("editing", "false");
            setSearchParams(searchParams);
        }
    }, [editMode]);

    useEffect(() => {
        if (mustFetchData) {
            const getProductDetails = async () => {
                try {
                    const response = await axios.get(
                        `${import.meta.env.VITE_API_URL}/product/${productNo}`
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
                            productDetails.attributes.dimensions.height.toFixed(
                                2
                            )
                        )
                    );
                    setWidth(
                        String(
                            productDetails.attributes.dimensions.width.toFixed(
                                2
                            )
                        )
                    );
                    setDepth(
                        String(
                            productDetails.attributes.dimensions.depth.toFixed(
                                2
                            )
                        )
                    );

                    setImageUrls(productDetails.images);

                    setLoading(false);
                } catch (error) {
                    axiosLogAndSetState(
                        error,
                        setError,
                        "fetching product details"
                    );
                }
            };

            getProductDetails();
            setMustFetchData(false);
        }
    }, [mustFetchData]);

    const handleDecimalInput = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        setAction: React.Dispatch<SetStateAction<string>>
    ) => {
        const regex = /^\d*\.?\d{0,2}$/;
        const { value } = event.currentTarget;
        if (regex.test(value) || value === "") {
            // event.currentTarget.value = value;
            setAction(value);
        } else {
            // event.currentTarget.value = value.slice(0, -1);
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
                (cat) => cat.categoryName === category
            );
            if (selectedCategory && selectedCategory.Subcategory.length > 0) {
                setSubcategories(
                    selectedCategory.Subcategory.map(
                        (subcategory) => subcategory.subcategoryName
                    )
                );
            } else {
                setSubcategories("disabled");
            }
        }
    }, [category, categories]);

    const handleSave = async () => {
        setIsConfirming(false);
        setIsSaving(true);
        type updateSubmission = {
            name: string;
            price: number;
            category: string;
            subcategory: string;
            color: string;
            material: string[];
            attributes: string;
            description: string;
            existingImageUrls: string[];
            images: ImageListType;
        };

        if (currentDetails) {
            const formData = new FormData();

            if (productName !== currentDetails.name) {
                formData.append("name", productName);
            }
            if (price !== String(currentDetails.price)) {
                formData.append("price", price);
            }
            if (category !== currentDetails.category) {
                formData.append("category", category);
            }
            if (subcategory !== currentDetails.subcategory) {
                formData.append("subcategory", subcategory);
            }
            if (description !== currentDetails.description) {
                formData.append("description", description);
            }

            let usedFileNames: string[] = [];
            if (images) {
                images.forEach((image, index) => {
                    console.log("usedFileNames:", usedFileNames);
                    console.log("currentDetails.images", currentDetails.images);
                    let newFileName = `${productName
                        .replace(/\s+/g, "_")
                        .toLowerCase()}`;
                    let i = 1;
                    newFileName = `${newFileName}_${i}`;
                    console.log("starting filename:", newFileName);
                    while (
                        currentDetails.images.includes(
                            `${
                                import.meta.env.VITE_CLOUDFRONT_DOMAIN
                            }/${newFileName}`
                        ) ||
                        usedFileNames.includes(newFileName)
                    ) {
                        newFileName = newFileName.replace(`_${i}`, `_${i + 1}`);
                        i++;
                    }
                    console.log("ending filename:", newFileName);
                    usedFileNames.push(newFileName);
                    formData.append("images", image.file as File, newFileName);
                });
            }

            if (
                color !== currentDetails.attributes.color ||
                materials !== currentDetails.attributes.material ||
                +weight !== currentDetails.attributes.weight ||
                +height !== currentDetails.attributes.dimensions.height ||
                +width !== currentDetails.attributes.dimensions.width ||
                +depth !== currentDetails.attributes.dimensions.depth
            ) {
                formData.append(
                    "attributes",
                    JSON.stringify({
                        color: color,
                        material: materials,
                        weight: +weight,
                        dimensions: {
                            width: +width,
                            height: +height,
                            depth: +depth,
                        },
                    })
                );
            }

            const areThereChanges =
                Array.from(formData.entries()).length !== 0 ||
                imageUrls.length !== currentDetails.images.length ||
                images.length !== 0;

            if (areThereChanges) {
                console.log("saving 4.5");
                formData.append("productNo", currentDetails.productNo);
                console.log("appending imageUrls:", imageUrls);
                if (imageUrls.length !== currentDetails.images.length) {
                    formData.append("existingImageUrls", imageUrls.join(", "));
                } else {
                    formData.append(
                        "existingImageUrls",
                        currentDetails.images.join(", ")
                    );
                }
                console.log("formData", formData.entries());
                const token = localStorage.getItem("jwtToken");
                try {
                    const response = await axios.put(
                        `${
                            import.meta.env.VITE_API_URL
                        }/product/update-details`,
                        formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                                Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                            },
                        }
                    );

                    setStatus("success");
                    searchParams.delete("editing");
                    setSearchParams(searchParams);
                    setMustFetchData(true);
                    setImages([]);
                } catch (error) {
                    axiosLogAndSetState(error, setError, "uploading files");
                }
            } else {
                console.log("no changes");
                setIsSaving(false);
            }
        }
    };

    //////////////////////////////

    useEffect(() => {
        if (!categories) dispatch(avFetchCategories());
    }, []);

    const categoryOptions = useMemo(
        () => categories.map((category) => category.categoryName),
        [categories]
    );

    return (
        <Container>
            <h1 style={{ marginBottom: "30px" }}>Product Details</h1>
            <Grid
                container
                spacing={3}
                sx={{
                    width: {
                        sm: "calc(100% + 48px)",
                        md: "calc(100% + 24px)",
                    },
                    marginLeft: { sm: "-36px", md: "-24px" },
                }}
            >
                <Grid
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
                    size={{
                        xs: 12,
                        lg: 5,
                    }}
                >
                    <ImageUploader
                        setImages={setImages}
                        images={images}
                        setImageUrls={setImageUrls}
                        imageUrls={imageUrls}
                        managedEditMode={true}
                        productEditMode={editMode}
                    />
                </Grid>
                <Grid
                    container
                    rowSpacing={3}
                    sx={{
                        alignItems: "space-between",
                        height: "auto",
                    }}
                    size={{
                        xs: 12,
                        lg: 7,
                    }}
                >
                    <TextField
                        fullWidth
                        variant={editMode ? "filled" : "standard"}
                        id="name"
                        label="ProductName"
                        required={editMode ? true : false}
                        slotProps={{
                            htmlInput: {
                                sx: editMode
                                    ? { backgroundColor: "white" }
                                    : undefined,
                                readOnly: editMode ? false : true,
                            },
                        }}
                        sx={editMode ? inputStyle : readOnlyStyle}
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
                                sx={editMode ? inputStyle : readOnlyStyle}
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
                                                  backgroundColor:
                                                      "white !important",
                                              }
                                            : undefined,
                                        readOnly: editMode ? false : true,
                                    },
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
                                sx={editMode ? inputStyle : readOnlyStyle}
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
                                sx={editMode ? inputStyle : readOnlyStyle}
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
                                sx={editMode ? inputStyle : readOnlyStyle}
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
                                sx={editMode ? inputStyle : readOnlyStyle}
                                setMultipleAction={setMaterials}
                                value={materials}
                                variant={editMode ? "filled" : "standard"}
                            />
                        </Grid>
                    </Grid>
                </Grid>
                <Grid container rowSpacing={3} size={12}>
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
                                              backgroundColor:
                                                  "white !important",
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
                                              backgroundColor:
                                                  "white !important",
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
                                              backgroundColor:
                                                  "white !important",
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
                                              backgroundColor:
                                                  "white !important",
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
                </Grid>
                <Grid size={12}>
                    <TextField
                        fullWidth
                        variant={editMode ? "filled" : "standard"}
                        id="description"
                        label="Description"
                        multiline={true}
                        rows={5}
                        required={editMode ? true : false}
                        sx={editMode ? inputStyle : readOnlyStyle}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        slotProps={{
                            htmlInput: {
                                sx: editMode
                                    ? {
                                          backgroundColor: "white !important",
                                      }
                                    : undefined,
                                readOnly: editMode ? false : true,
                            },
                        }}
                    />
                </Grid>
                <Grid
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        width: "100%",
                        flexDirection: { xs: "column-reverse", md: "row" },
                    }}
                >
                    <Button
                        variant="outlined"
                        sx={{
                            color: "black",
                            width: {
                                xs: "100%",

                                md: "auto",
                            },
                        }}
                        onClick={() =>
                            navigate(previous.path || "/products/manage")
                        }
                    >
                        &lt; Back to {previous.name}
                    </Button>
                    {editMode && (
                        <Box
                            className="edit-mode-buttons"
                            sx={{
                                mb: { xs: 2, md: 0 },
                                width: { xs: "100%", md: "auto" },
                            }}
                        >
                            <Button
                                variant="contained"
                                onClick={() => setIsConfirming(true)}
                                disabled={accessLevel === "view only"}
                                sx={{
                                    width: {
                                        xs: "calc(50% - 10px)",
                                        md: "auto",
                                    },
                                }}
                            >
                                Save Changes
                            </Button>
                            <Button
                                sx={{
                                    marginLeft: "20px",
                                    width: {
                                        xs: "calc(50% - 10px)",
                                        md: "auto",
                                    },
                                }}
                                variant="contained"
                                onClick={() => {
                                    searchParams.delete("editing");
                                    setSearchParams(searchParams);
                                    setMustFetchData(true);
                                }}
                            >
                                Cancel
                            </Button>
                        </Box>
                    )}
                    {accessLevel !== "view only" && !editMode && (
                        <Button
                            variant="contained"
                            onClick={() => {
                                searchParams.set("editing", "true");
                                setSearchParams(searchParams);
                            }}
                            sx={{
                                mb: { xs: 2, md: 0 },
                                width: {
                                    xs: "100%",

                                    md: "auto",
                                },
                            }}
                        >
                            Edit
                        </Button>
                    )}
                </Grid>
            </Grid>
            {isConfirming && (
                <BlankPopup className="save-confirmation">
                    <span style={{ marginBottom: "20px" }}>
                        Save changes made to product
                        {currentDetails ? " " + currentDetails.productNo : ""}?
                    </span>
                    <div className="save-confirmation-buttons">
                        <Button
                            variant="contained"
                            onClick={() => handleSave()}
                            sx={{ color: "white" }}
                        >
                            Yes, Save
                        </Button>
                        <Button
                            variant="contained"
                            onClick={() => {
                                setIsConfirming(false);
                                searchParams.set("editing", "true");
                                setSearchParams(searchParams);
                            }}
                            sx={{ marginLeft: "20px", color: "white" }}
                        >
                            Wait!
                        </Button>
                    </div>
                </BlankPopup>
            )}
            {isSaving && (
                <StatusPopup
                    status={status}
                    loadingMessage="Saving updated product data..."
                    successMessage="Product details successfully updated"
                    failureMessage={`Failed to save updates ${
                        error ? ": " + error : ""
                    }`}
                    actionFunction={() => {
                        setIsSaving(false);
                        setError(null);
                    }}
                />
            )}
        </Container>
    );
};
export default AVProductDetails;
