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
    TextField,
    Box,
    Button,
} from "@mui/material";

import axios, { AxiosError } from "axios";
import "./av-order-details.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import BlankPopup from "../../../common/components/BlankPopup";
import StatusPopup from "../../../common/components/StatusPopup";
import { AVOrder } from "../OrderManagement/OrderManagement";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import updateLocale from "dayjs/plugin/updateLocale";
import { MuiTelInput } from "mui-tel-input";
dayjs.extend(customParseFormat);
dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
    months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ],
});

///////////////////
///////TYPES///////
///////////////////

interface AVOrderItem {
    order_item_id: number;
    order_id: number;
    productNo: string;
    Product: {
        id: number;
        productNo: string;
        productName: string;
        price: number;
        description: string;
        category_id: number;
        subCategory_id?: number;
        thumbnailUrl?: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
    };
    quantity: number;
    priceWhenOrdered: number;
    fulfillmentStatus: string;
}
interface AVOrderDetails extends AVOrder {
    OrderItem: AVOrderItem[];
}

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

const AVOrderDetails: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const orderNo = searchParams.get("order");
    const editMode = searchParams.get("editing") === "true" ? true : false;

    const [currentDetails, setCurrentDetails] = useState<AVOrderDetails | null>(
        null
    );
    const [shippingAddress1, setShippingAddress1] = useState<string>("");
    const [shippingAddress2, setShippingAddress2] = useState<string>("");
    const [state, setState] = useState<string>("");
    const [orderStatus, setOrderStatus] = useState<string>("");
    const [zipCode, setZipCode] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [subTotal, setSubTotal] = useState<string>("");
    const [shipping, setShipping] = useState<string>("");
    const [tax, setTax] = useState<string>("");
    const [total, setTotal] = useState<string>("");
    const [items, setItems] = useState<AVOrderItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isConfirming, setIsConfirming] = useState<boolean>(false);
    const [status, setStatus] = useState<"loading" | "success" | "failure">(
        "loading"
    );

    const [error, setError] = useState<null | string>(null);
    const [mustFetchData, setMustFetchData] = useState<boolean>(true);
    const taxRate = 0.06;

    useEffect(() => {
        if (mustFetchData) {
            const getOrderDetails = async () => {
                try {
                    const response = await axios.get(
                        `${process.env.REACT_APP_API_URL}order/${orderNo}`
                    );
                    const orderDetails: AVOrderDetails = response.data;
                    console.log("orderDetails", orderDetails);
                    setCurrentDetails(orderDetails);
                    setState(orderDetails.stateAbbr);
                    const splitAddress =
                        orderDetails.shippingAddress.split(" | ");
                    setShippingAddress1(splitAddress[0]);
                    if (splitAddress[1]) {
                        setShippingAddress2(splitAddress[1]);
                    }
                    setOrderStatus(orderDetails.orderStatus);
                    setEmail(orderDetails.email);
                    setZipCode(orderDetails.zipCode);
                    setPhone(orderDetails.phoneNumber);
                    setItems(orderDetails.OrderItem);
                    setShipping(orderDetails.shipping);
                    setTotal(orderDetails.totalAmount);
                    setSubTotal(orderDetails.subTotal);
                    setTax(orderDetails.tax);

                    setLoading(false);
                } catch (error) {
                    if (error instanceof AxiosError) {
                        console.error("Error fetching order details", error);
                    } else {
                        console.error(
                            "An unknown error has ocurred while fetching order details"
                        );
                    }
                }
            };

            getOrderDetails();
            setMustFetchData(false);
        }
    }, [mustFetchData]);

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

    // useEffect(() => {
    //     if (category) {
    //         const selectedCategory = categories.find(
    //             (cat) => cat.name === category
    //         );
    //         if (selectedCategory && selectedCategory.subCategories.length > 0) {
    //             setSubCategories(selectedCategory.subCategories);
    //         } else {
    //             setSubCategories("disabled");
    //         }
    //     }
    // }, [category, categories]);
    const handleSave = () => {};
    // const handleSave = async () => {
    //     console.log("saving...");
    //     setIsConfirming(false);
    //     setIsSaving(true);
    //     console.log("starting submit process");
    //     type updateSubmission = {
    //         name: string;
    //         price: number;
    //         category: string;
    //         subcategory: string;
    //         color: string;
    //         material: string[];
    //         attributes: string;
    //         description: string;
    //         existingImageUrls: string[];
    //         images: ImageListType;
    //     };
    //     console.log("saving1");
    //     console.log("currentDetails:", currentDetails);
    //     if (currentDetails) {
    //         const formData = new FormData();

    //         if (productName !== currentDetails.name) {
    //             formData.append("name", productName);
    //         }
    //         if (price !== String(currentDetails.price)) {
    //             formData.append("price", price);
    //         }
    //         if (category !== currentDetails.category) {
    //             formData.append("category", category);
    //         }
    //         if (subcategory !== currentDetails.subcategory) {
    //             formData.append("subcategory", subcategory);
    //         }
    //         if (description !== currentDetails.description) {
    //             formData.append("description", description);
    //         }
    //         console.log("saving2");
    //         if (images) {
    //             images.forEach((image, index) => {
    //                 let newFileName = `${productName
    //                     .replace(/\s+/g, "_")
    //                     .toLowerCase()}_${index + 1}`;
    //                 let i = 1;
    //                 while (
    //                     currentDetails.images.includes(
    //                         `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${newFileName}`
    //                     )
    //                 ) {
    //                     newFileName = `${newFileName}a${i}`;
    //                 }
    //                 formData.append("images", image.file as File, newFileName);
    //             });
    //         }
    //         console.log("saving3");
    //         if (
    //             color !== currentDetails.attributes.color ||
    //             materials !== currentDetails.attributes.material ||
    //             +weight !== currentDetails.attributes.weight ||
    //             +height !== currentDetails.attributes.dimensions.height ||
    //             +width !== currentDetails.attributes.dimensions.width ||
    //             +depth !== currentDetails.attributes.dimensions.depth
    //         ) {
    //             formData.append(
    //                 "attributes",
    //                 JSON.stringify({
    //                     color: color,
    //                     material: materials,
    //                     weight: +weight,
    //                     dimensions: {
    //                         width: +width,
    //                         height: +height,
    //                         depth: +depth,
    //                     },
    //                 })
    //             );
    //         }

    //         const areThereChanges =
    //             Array.from(formData.entries()).length !== 0 ||
    //             console.log("saving4");
    //         if (areThereChanges) {
    //             console.log("saving 4.5");
    //             formData.append("productNo", currentDetails.productNo);

    //             console.log("saving5");

    //             try {
    //                 const response = await axios.put(
    //                     `${process.env.REACT_APP_API_URL}order/update`,
    //                     formData,
    //                     {
    //                         headers: {
    //                             "Content-Type": "multipart/form-data",
    //                         },
    //                     }
    //                 );
    //                 console.log("Response:", response.data);
    //                 setStatus("success");
    //                 searchParams.delete("editing");
    //                 setSearchParams(searchParams);
    //                 setMustFetchData(true);
    //             } catch (error) {
    //                 if (error instanceof AxiosError) {
    //                     setError(error.message);
    //                 }
    //                 setStatus("failure");
    //                 console.error("Error uploading files:", error);
    //             }
    //         } else {
    //             console.log("no changes");
    //             setIsSaving(false);
    //         }
    //     }
    // };

    const handleTelInputChange = (value: string, info: any) => {
        setPhone(value);
    };

    return (
        <React.Fragment>
            {!loading && currentDetails && (
                <Container>
                    <div className="number-date">
                        <h1 style={{ marginBottom: "30px" }}>
                            Order {orderNo?.toLowerCase()}
                        </h1>
                        <div className="date">
                            <h2>OrderDate</h2>
                            <span>
                                {dayjs(currentDetails.orderDate).format(
                                    "DD MMMM, YYYY"
                                )}
                            </span>
                            <span>
                                {dayjs(currentDetails.orderDate).format(
                                    "HH:mm:ss"
                                )}
                            </span>
                        </div>
                    </div>
                    <Grid container spacing={3} sx={{ width: "100%" }}>
                        <Grid container item xs={12} lg={6} rowSpacing={3}>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    variant={editMode ? "filled" : "standard"}
                                    id="shipping1"
                                    label="Shipping Address 1"
                                    required={editMode ? true : false}
                                    inputProps={{
                                        sx: editMode
                                            ? { backgroundColor: "white" }
                                            : undefined,
                                        readOnly: editMode ? false : true,
                                    }}
                                    sx={editMode ? inputStyle : readOnlyStyle}
                                    value={shippingAddress1}
                                    onChange={(e) =>
                                        setShippingAddress1(e.target.value)
                                    }
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    variant={editMode ? "filled" : "standard"}
                                    id="shipping2"
                                    label="Shipping Address 2"
                                    required={editMode ? true : false}
                                    inputProps={{
                                        sx: editMode
                                            ? { backgroundColor: "white" }
                                            : undefined,
                                        readOnly: editMode ? false : true,
                                    }}
                                    sx={editMode ? inputStyle : readOnlyStyle}
                                    value={shippingAddress2}
                                    onChange={(e) =>
                                        setShippingAddress2(e.target.value)
                                    }
                                />
                            </Grid>
                            <Grid spacing={3} item container xs={12}>
                                <Grid item sm={5}>
                                    <TextField
                                        fullWidth
                                        variant={
                                            editMode ? "filled" : "standard"
                                        }
                                        id="city"
                                        label="City"
                                        required={false}
                                        inputProps={{
                                            sx: editMode
                                                ? { backgroundColor: "white" }
                                                : undefined,
                                            readOnly: true,
                                        }}
                                        sx={
                                            editMode
                                                ? inputStyle
                                                : readOnlyStyle
                                        }
                                        value={"Indianapolis"}
                                    />
                                </Grid>
                                <Grid item sm={3}>
                                    <TextField
                                        fullWidth
                                        variant={
                                            editMode ? "filled" : "standard"
                                        }
                                        id="state"
                                        label="State"
                                        required={editMode ? true : false}
                                        inputProps={{
                                            pattern: "^[a-ZA-Z]{2}$",
                                            sx: editMode
                                                ? {
                                                      backgroundColor:
                                                          "white !important",
                                                  }
                                                : undefined,
                                            readOnly: editMode ? false : true,
                                        }}
                                        sx={
                                            editMode
                                                ? inputStyle
                                                : readOnlyStyle
                                        }
                                        value={state}
                                        onChange={(e) =>
                                            setState(
                                                e.target.value.toUpperCase()
                                            )
                                        }
                                    />
                                </Grid>
                                <Grid item sm={4}>
                                    <TextField
                                        fullWidth
                                        variant={
                                            editMode ? "filled" : "standard"
                                        }
                                        id="zipcode"
                                        label="zipCode"
                                        required={editMode ? true : false}
                                        inputProps={{
                                            pattern: "^[0-9]{5}$",
                                            sx: editMode
                                                ? {
                                                      backgroundColor:
                                                          "white !important",
                                                  }
                                                : undefined,
                                            readOnly: editMode ? false : true,
                                        }}
                                        sx={
                                            editMode
                                                ? inputStyle
                                                : readOnlyStyle
                                        }
                                        value={zipCode}
                                        onChange={(e) =>
                                            setZipCode(e.target.value)
                                        }
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
                                    <TextField
                                        fullWidth
                                        variant={
                                            editMode ? "filled" : "standard"
                                        }
                                        id="email"
                                        label="email"
                                        required={editMode ? true : false}
                                        inputProps={{
                                            pattern:
                                                "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$",
                                            sx: editMode
                                                ? {
                                                      backgroundColor:
                                                          "white !important",
                                                  }
                                                : undefined,
                                            readOnly: editMode ? false : true,
                                        }}
                                        sx={
                                            editMode
                                                ? inputStyle
                                                : readOnlyStyle
                                        }
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                    />
                                </Grid>
                                <Grid item sm={6}>
                                    <MuiTelInput
                                        id="phone"
                                        name="phoneNumber"
                                        autoComplete="tel"
                                        value={phone}
                                        onChange={handleTelInputChange}
                                        required
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid spacing={3} item xs={12} lg={6} container>
                            <Grid
                                item
                                xs={6}
                                md={3}
                                // sx={{ paddingLeft: { xs: "24px", md: "48px" } }}
                            >
                                <TextField
                                    fullWidth
                                    variant={editMode ? "filled" : "standard"}
                                    id="price"
                                    label="Price"
                                    required={false}
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
                                        readOnly: true,
                                    }}
                                    sx={editMode ? inputStyle : readOnlyStyle}
                                    value={subTotal}
                                />
                            </Grid>
                            <Grid
                                item
                                xs={6}
                                md={3}
                                // sx={{ paddingLeft: { xs: "24px", md: "48px" } }}
                            >
                                <TextField
                                    fullWidth
                                    variant={editMode ? "filled" : "standard"}
                                    id="shippingCost"
                                    label="Shipping"
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
                                    value={shipping}
                                    onChange={(e) =>
                                        handleDecimalInput(e, setShipping)
                                    }
                                    onBlur={(e) =>
                                        handleDecimalBlur(e, setShipping)
                                    }
                                />
                            </Grid>
                            <Grid
                                item
                                xs={6}
                                md={3}
                                // sx={{ paddingLeft: { xs: "24px", md: "48px" } }}
                            >
                                <TextField
                                    fullWidth
                                    variant={editMode ? "filled" : "standard"}
                                    id="tax"
                                    label="Tax"
                                    required={false}
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
                                        readOnly: true,
                                    }}
                                    sx={editMode ? inputStyle : readOnlyStyle}
                                    value={tax}
                                />
                            </Grid>
                            <Grid
                                item
                                xs={6}
                                md={3}
                                // sx={{ paddingLeft: { xs: "24px", md: "48px" } }}
                            >
                                <TextField
                                    fullWidth
                                    variant={editMode ? "filled" : "standard"}
                                    id="price"
                                    label="Price"
                                    required={false}
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
                                        readOnly: true,
                                    }}
                                    sx={editMode ? inputStyle : readOnlyStyle}
                                    value={total}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    {isConfirming && (
                        <BlankPopup className="save-confirmation">
                            <span style={{ marginBottom: "20px" }}>
                                Save changes made to order
                                {currentDetails
                                    ? " " + currentDetails.orderNo
                                    : ""}
                                ?
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
            )}
        </React.Fragment>
    );
};
export default AVOrderDetails;
