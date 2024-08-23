import React, {
    ComponentProps,
    useState,
    useEffect,
    useCallback,
    useMemo,
} from "react";
import "./add-product.css";
import {
    Grid,
    Container,
    InputAdornment,
    Paper,
    TextField,
    Box,
    Button,
} from "@mui/material";
import {
    Formik,
    Form,
    ErrorMessage,
    FormikHelpers,
    useFormikContext,
} from "formik";
import { FormField } from "../../../common/components/Fields/FormField";
import { SelectField } from "../../../common/components/Fields/SelectField";
import axios, { AxiosError } from "axios";
import "./add-product.css";
import PeachButton from "../../../common/components/PeachButton";
import { Link, useNavigate } from "react-router-dom";
import ImageUploader from "../ImageUploader/ImageUploader";
import { ImageListType } from "react-images-uploading";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/store";
import { avFetchCategories } from "../../features/AVMenuData/avMenuDataSlice";
import { AVCategory } from "../../features/AVMenuData/avMenuDataTypes";

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

////////////////////////////////////////
///////SPECIALIZED CATEGORY FIELD///////
////////////////////////////////////////

interface DynamicCategoryProps {
    label: string;
    name: string;
    multiple: boolean;
    options: string[];
    required: boolean;
    sx?: ComponentProps<typeof TextField>["sx"];
    categories: AVCategory[];
    setSubCategories: React.Dispatch<
        React.SetStateAction<string[] | "disabled">
    >;
}
//Dynamic category is an extra layer on top of SelectField that allows the category field to update the subcategories field based on user selection
const DynamicCategory: React.FC<DynamicCategoryProps> = ({
    label,
    name,
    options,
    required,
    sx,
    categories,
    setSubCategories,
}) => {
    const { values } = useFormikContext<Submission>();
    const memoizedSetSubCategories = useCallback(
        (subCategories: string[] | "disabled") => {
            setSubCategories(subCategories);
        },
        [setSubCategories]
    );

    useEffect(() => {
        if (values.category) {
            const selectedCategory = categories.find(
                (category) => category.categoryName === values.category
            );
            if (selectedCategory && selectedCategory.SubCategory.length > 0) {
                memoizedSetSubCategories(
                    selectedCategory.SubCategory.map(
                        (subcategory) => subcategory.subCategoryName
                    )
                );
            } else {
                memoizedSetSubCategories("disabled");
            }
        }
    }, [values.category, categories, memoizedSetSubCategories]);

    useEffect(() => {
        console.log("values.category useEffect", values.category, Date.now());
    }, [values.category]);

    return (
        <SelectField
            label={label}
            name={name}
            multiple={false}
            required={required}
            options={options}
            sx={sx}
        />
    );
};

////////////////////////////
///////MAIN COMPONENT///////
////////////////////////////

const AddProduct: React.FC = () => {
    const categories = useAppSelector(
        (state: RootState) => state.avMenuData.categories
    );
    const [subCategories, setSubCategories] = useState<string[] | "disabled">(
        "disabled"
    );
    const [images, setImages] = useState<ImageListType>([]);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    ///////FORMIK PARAMETERS///////

    const initialValues: Submission = {
        name: "",
        prefix: "",
        price: 0,
        category: "",
        subcategory: "",
        color: "",
        material: [],
        height: "",
        width: "",
        depth: "",
        weight: "",
        description: "",
    };

    const validate = (values: Submission) => {
        const errors: Record<string, string> = {};
        if (+values.price === 0 || !values.price) {
            errors.price = "Price must be greater than 0";
            console.log(errors);
        }
        console.log(values);
    };

    const handleSubmit = async (
        values: Submission,
        actions: FormikHelpers<Submission>
    ) => {
        actions.setSubmitting(true);
        console.log("starting submit process");
        const formData = new FormData();
        formData.append("name", values.name);
        formData.append("category", values.category);
        if (values.subcategory) {
            formData.append("subCategory", values.subcategory);
        }
        formData.append("prefix", values.prefix.toLowerCase());
        formData.append("description", values.description);
        formData.append(
            "attributes",
            JSON.stringify({
                color: values.color,
                material: values.material,
                weight: values.weight,
                dimensions: {
                    width: values.width,
                    height: values.height,
                    depth: values.depth,
                },
            })
        );
        formData.append("price", values.price.toString());
        images.forEach((image, index) => {
            const newFileName = `${values.name
                .replace(/\s+/g, "_")
                .toLowerCase()}_${index + 1}`;
            formData.append("images", image.file as File, newFileName);
        });

        const token = localStorage.getItem("jwtToken");
        console.log("token:", token);
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/product/create`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            console.error("Error uploading files:", error);
        } finally {
            actions.setSubmitting(false);
            navigate("/products/manage");
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
            <h1>Create a Product</h1>
            <Formik
                initialValues={initialValues}
                validate={validate}
                onSubmit={handleSubmit}
            >
                <Form>
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
                            <ImageUploader
                                setImages={setImages}
                                images={images}
                            />
                        </Grid>
                        <Grid
                            container
                            item
                            xs={12}
                            lg={7}
                            rowSpacing={3}
                            sx={{
                                alignItems: "space-between",
                                height: "auto",
                            }}
                        >
                            <FormField
                                label="Product Name"
                                name="name"
                                required={true}
                                sx={inputStyle}
                                inputSx={{ backgroundColor: "white" }}
                            />

                            <Grid
                                columnSpacing={3}
                                sx={{ display: "flex", flexWrap: "wrap" }}
                                item
                                container
                                xs={12}
                            >
                                <Grid item xs={6}>
                                    <FormField
                                        label="Prefix"
                                        name="prefix"
                                        required={true}
                                        pattern="^[a-zA-Z]{1,2}$"
                                        sx={inputStyle}
                                        inputSx={{ backgroundColor: "white" }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <FormField
                                        label="Price"
                                        name="price"
                                        required={true}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment
                                                    position="start"
                                                    sx={{
                                                        backgroundColor:
                                                            "white",
                                                        "&.MuiInputAdornment-root":
                                                            {
                                                                backgroundColor:
                                                                    "white !important",
                                                            },
                                                    }}
                                                    style={{
                                                        backgroundColor:
                                                            "white !important",
                                                    }}
                                                >
                                                    $
                                                </InputAdornment>
                                            ),
                                        }}
                                        pattern="^\d*\.?\d{0,2}$"
                                        inputMode="decimal"
                                        sx={inputStyle}
                                        inputSx={{
                                            backgroundColor: "white !important",
                                        }}
                                    />
                                </Grid>
                            </Grid>
                            <Grid
                                spacing={3}
                                sx={{ display: "flex", flexWrap: "wrap" }}
                                item
                                xs={12}
                                container
                            >
                                <Grid item xs={12} sm={6}>
                                    <DynamicCategory
                                        label="Category"
                                        name="category"
                                        multiple={false}
                                        required={true}
                                        options={categoryOptions}
                                        categories={categories}
                                        setSubCategories={setSubCategories}
                                        sx={inputStyle}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <SelectField
                                        label="Subcategory"
                                        name="subcategory"
                                        multiple={false}
                                        required={false}
                                        options={subCategories}
                                        sx={inputStyle}
                                    />
                                </Grid>
                            </Grid>
                            <Grid
                                spacing={3}
                                sx={{ display: "flex", flexWrap: "wrap" }}
                                item
                                xs={12}
                                container
                            >
                                <Grid item xs={12} sm={6}>
                                    <SelectField
                                        label="Color"
                                        name="color"
                                        multiple={false}
                                        required={true}
                                        options={colorOptions}
                                        sx={inputStyle}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <SelectField
                                        label="Material"
                                        name="material"
                                        multiple={true}
                                        required={true}
                                        options={materialOptions}
                                        sx={inputStyle}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} rowSpacing={3}>
                            <Grid
                                item
                                xs={6}
                                lg={3}
                                sx={{
                                    paddingRight: { xs: "12px", lg: "36px" },
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
                                                    "&.MuiInputAdornment-root":
                                                        {
                                                            backgroundColor:
                                                                "white !important",
                                                        },
                                                }}
                                                style={{
                                                    backgroundColor:
                                                        "white !important",
                                                }}
                                            >
                                                in.
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid
                                item
                                xs={6}
                                lg={3}
                                sx={{
                                    paddingLeft: { xs: "12px", lg: "12px" },
                                    paddingRight: { lg: "24px" },
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
                                                    "&.MuiInputAdornment-root":
                                                        {
                                                            backgroundColor:
                                                                "white !important",
                                                        },
                                                }}
                                                style={{
                                                    backgroundColor:
                                                        "white !important",
                                                }}
                                            >
                                                in.
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid
                                item
                                xs={6}
                                lg={3}
                                sx={{
                                    paddingLeft: { lg: "24px" },
                                    paddingRight: "12px",
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
                                                    "&.MuiInputAdornment-root":
                                                        {
                                                            backgroundColor:
                                                                "white !important",
                                                        },
                                                }}
                                                style={{
                                                    backgroundColor:
                                                        "white !important",
                                                }}
                                            >
                                                in.
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                            <Grid
                                item
                                xs={6}
                                lg={3}
                                sx={{ paddingLeft: { xs: "12px", lg: "36px" } }}
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
                                                    "&.MuiInputAdornment-root":
                                                        {
                                                            backgroundColor:
                                                                "white !important",
                                                        },
                                                }}
                                                style={{
                                                    backgroundColor:
                                                        "white !important",
                                                }}
                                            >
                                                lbs.
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <FormField
                                label="Description"
                                name="description"
                                required={true}
                                multiline={true}
                                rows={5}
                                sx={inputStyle}
                                inputSx={{
                                    backgroundColor: "white !important",
                                }}
                            />
                        </Grid>
                        <Grid
                            item
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                width: "100%",
                                flexDirection: { xs: "column", md: "row" },
                                gap: { xs: 2, md: 0 },
                            }}
                        >
                            <Button
                                variant="outlined"
                                onClick={() => navigate("/products/manage")}
                                sx={{
                                    color: "black",
                                    width: {
                                        xs: "100%",

                                        md: "auto",
                                    },
                                }}
                            >
                                &lt; Back to product management
                            </Button>
                            <Button
                                variant="contained"
                                type="submit"
                                sx={{
                                    width: {
                                        xs: "100%",

                                        md: "auto",
                                    },
                                }}
                            >
                                Create Product
                            </Button>
                        </Grid>
                    </Grid>
                </Form>
            </Formik>
        </Container>
    );
};
export default AddProduct;
