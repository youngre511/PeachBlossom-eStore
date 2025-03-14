import React, {
    useState,
    useEffect,
    useMemo,
    SetStateAction,
    useContext,
} from "react";
import { Grid2 as Grid, Container, TextField, Button } from "@mui/material";

import axios from "axios";
import "./av-product-details.css";
import { useSearchParams } from "react-router-dom";
import ImageUploader from "../../../components/ImageUploader/ImageUploader";
import { ImageListType } from "react-images-uploading";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { RootState } from "../../../store/store";
import { avFetchCategories } from "../../../store/AVMenuData/avMenuDataSlice";
import BlankPopup from "../../../../common/components/BlankPopup";
import StatusPopup from "../../../../common/components/StatusPopup";
import { AuthContext } from "../../../../common/contexts/authContext";
import { useNavigationContext } from "../../../../common/contexts/navContext";
import { axiosLogAndSetState } from "../../../../common/utils/axiosLogAndSetState";
import ProductInfoForm from "./ProductDetailComponents/ProductInfoForm";
import ProductDimensionsForm from "./ProductDetailComponents/ProductDimensionsForm";
import ProductActionButtons from "./ProductDetailComponents/ProductActionButtons";
import { constructProductFormData } from "./utils/avProductUtils";
import {
    adminFormInputStyle,
    adminReadOnlyStyle,
} from "../../../constants/formInputStyles";

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

export interface OneProduct {
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

        if (currentDetails) {
            const formData = constructProductFormData(
                productName,
                price,
                category,
                subcategory,
                description,
                images,
                color,
                materials,
                weight,
                height,
                width,
                depth,
                currentDetails
            );

            const areThereChanges =
                Array.from(formData.entries()).length !== 0 ||
                imageUrls.length !== currentDetails.images.length ||
                images.length !== 0;

            if (areThereChanges) {
                formData.append("productNo", currentDetails.productNo);

                if (imageUrls.length !== currentDetails.images.length) {
                    imageUrls.forEach((url) =>
                        formData.append("existingImageUrls", url)
                    );
                } else {
                    currentDetails.images.forEach((url) =>
                        formData.append("existingImageUrls", url)
                    );
                }
                const token = localStorage.getItem("jwtToken");
                try {
                    await axios.put(
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
                    <ProductInfoForm
                        productName={productName}
                        setProductName={setProductName}
                        productNo={productNo}
                        price={price}
                        setPrice={setPrice}
                        handleDecimalInput={handleDecimalInput}
                        handleDecimalBlur={handleDecimalBlur}
                        category={category}
                        setCategory={setCategory}
                        subcategory={subcategory}
                        setSubcategory={setSubcategory}
                        categoryOptions={categoryOptions}
                        subcategories={subcategories}
                        color={color}
                        setColor={setColor}
                        materials={materials}
                        setMaterials={setMaterials}
                        editMode={editMode}
                    />
                </Grid>
                <Grid container rowSpacing={3} size={12}>
                    <ProductDimensionsForm
                        weight={weight}
                        setWeight={setWeight}
                        height={height}
                        setHeight={setHeight}
                        width={width}
                        setWidth={setWidth}
                        depth={depth}
                        setDepth={setDepth}
                        editMode={editMode}
                        handleDecimalInput={handleDecimalInput}
                        handleDecimalBlur={handleDecimalBlur}
                    />
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
                        sx={editMode ? adminFormInputStyle : adminReadOnlyStyle}
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
                    <ProductActionButtons
                        editMode={editMode}
                        setIsConfirming={setIsConfirming}
                        setMustFetchData={setMustFetchData}
                        searchParams={searchParams}
                        setSearchParams={setSearchParams}
                        accessLevel={accessLevel}
                        previous={previous}
                    />
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
