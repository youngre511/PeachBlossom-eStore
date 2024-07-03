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
import { FormField } from "../Fields/FormField";
import { SelectField } from "../Fields/SelectField";
import axios, { AxiosError } from "axios";
import "./add-product.css";
import PeachButton from "../../../common/components/PeachButton";
import { Link } from "react-router-dom";
import ImageUploader from "../ImageUploader/ImageUploader";

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

const inputStyle = {
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

///////////////////////////////
///////FORMIK PARAMETERS///////
///////////////////////////////

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
    categories: Category[];
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
                (category) => category.name === values.category
            );
            if (selectedCategory && selectedCategory.subCategories.length > 0) {
                memoizedSetSubCategories(selectedCategory.subCategories);
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
    const [categories, setCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<string[] | "disabled">(
        "disabled"
    );

    useEffect(() => {
        console.log("running getCategories");
        const getCategories = async () => {
            try {
                const response = await axios.get<FetchCategoriesResponse>(
                    `${process.env.REACT_APP_API_URL}category`
                );
                setCategories(response.data.payload);
            } catch (error: any) {
                if (error instanceof AxiosError) {
                    console.error("Error getting categories", error);
                } else {
                    console.error(
                        "An unknown error has ocurred while getting categories"
                    );
                }
            }
        };
        getCategories();
    }, []);

    const categoryOptions = useMemo(
        () => categories.map((category) => category.name),
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
                    <Grid container spacing={3} mt={3} sx={{ width: "100%" }}>
                        <Grid
                            item
                            md={6}
                            sx={{
                                paddingTop: "0 !important",
                                alignItems: "stretch",
                                alignSelf: "stretch",
                            }}
                        >
                            <ImageUploader />
                        </Grid>
                        <Grid
                            container
                            item
                            md={6}
                            rowSpacing={3}
                            sx={{ alignItems: "space-between", height: "auto" }}
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
                            >
                                <Grid item md={6}>
                                    <FormField
                                        label="Prefix"
                                        name="prefix"
                                        required={true}
                                        pattern="^[a-zA-Z]{1,2}$"
                                        sx={inputStyle}
                                        inputSx={{ backgroundColor: "white" }}
                                    />
                                </Grid>
                                <Grid item md={6}>
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
                                columnSpacing={3}
                                sx={{ display: "flex", flexWrap: "wrap" }}
                                item
                                container
                            >
                                <Grid item md={6}>
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
                                <Grid item md={6}>
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
                                columnSpacing={3}
                                sx={{ display: "flex", flexWrap: "wrap" }}
                                item
                                container
                            >
                                <Grid item md={6}>
                                    <SelectField
                                        label="Color"
                                        name="color"
                                        multiple={false}
                                        required={true}
                                        options={colorOptions}
                                        sx={inputStyle}
                                    />
                                </Grid>
                                <Grid item md={6}>
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
                        <Grid container item xs={12} columnSpacing={6}>
                            <Grid item md={3}>
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
                            <Grid item md={3}>
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
                            <Grid item md={3}>
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
                            <Grid item md={3}>
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
                            }}
                        >
                            <Button
                                variant="outlined"
                                href="/products/manage"
                                sx={{ color: "black" }}
                            >
                                &lt; Back to product management
                            </Button>
                            <Button variant="contained" type="submit">
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
