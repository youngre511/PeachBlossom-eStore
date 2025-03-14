import React, { useState, useEffect, useMemo } from "react";
import "./add-product.css";
import { Grid2 as Grid, Container, Button } from "@mui/material";
import { Formik, Form, FormikHelpers } from "formik";
import { FormField } from "../../../../common/components/Fields/FormField";
import axios from "axios";
import "./add-product.css";

import { useNavigate } from "react-router-dom";
import ImageUploader from "../ImageUploader/ImageUploader";
import { ImageListType } from "react-images-uploading";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { RootState } from "../../../store/store";
import { avFetchCategories } from "../../AVMenuData/avMenuDataSlice";
import AddProductInfoForm from "./AddProductSubcomponents/AddProductInfoForm";
import { adminFormInputStyle } from "../../../constants/formInputStyles";
import AddProductDimensionsForm from "./AddProductSubcomponents/AddProductDimensionsForm";

///////////////////
///////TYPES///////
///////////////////
export type Submission = {
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
    subcategories: string[];
}

////////////////////////////
///////MAIN COMPONENT///////
////////////////////////////

const AddProduct: React.FC = () => {
    const categories = useAppSelector(
        (state: RootState) => state.avMenuData.categories
    );
    const [subcategories, setSubcategories] = useState<string[] | "disabled">(
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
            formData.append("subcategory", values.subcategory);
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
            await axios.post(
                `${import.meta.env.VITE_API_URL}/product/create`,
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
            <h1 className="create-header">Create a Product</h1>
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
                            <AddProductInfoForm
                                subcategories={subcategories}
                                setSubcategories={setSubcategories}
                                categoryOptions={categoryOptions}
                            />
                        </Grid>
                        <Grid container rowSpacing={3} size={12}>
                            <AddProductDimensionsForm />
                        </Grid>
                        <Grid size={12}>
                            <FormField
                                label="Description"
                                name="description"
                                required={true}
                                multiline={true}
                                rows={5}
                                sx={adminFormInputStyle}
                                inputSx={{
                                    backgroundColor: "white !important",
                                }}
                            />
                        </Grid>
                        <Grid
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
