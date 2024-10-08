import React, {
    useState,
    useEffect,
    useCallback,
    SetStateAction,
    useContext,
} from "react";
import {
    Grid,
    Container,
    InputAdornment,
    TextField,
    Button,
} from "@mui/material";

import axios, { AxiosError } from "axios";
import "./av-order-details.css";
import { useNavigate, useSearchParams } from "react-router-dom";
import BlankPopup from "../../../common/components/BlankPopup";
import StatusPopup from "../../../common/components/StatusPopup";
import {
    IAVOrderItem,
    IAVOrderDetails,
} from "../../features/AVOrders/avOrdersTypes";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import updateLocale from "dayjs/plugin/updateLocale";
import { MuiTelInput } from "mui-tel-input";
import AVOrderItemList from "./AVOrderItemList";
import { SelectFieldNonFormik } from "../../../common/components/Fields/SelectFieldNonFormik";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/store";
import { avFetchOrderDetails } from "../../features/AVOrders/avOrdersSlice";
import { AuthContext } from "../../../common/contexts/authContext";
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
    const avOrderDetails = useAppSelector(
        (state: RootState) => state.avOrder.orderDetails
    );
    const dispatch = useAppDispatch();
    const [currentDetails, setCurrentDetails] =
        useState<IAVOrderDetails | null>(null);
    const [shippingAddress1, setShippingAddress1] = useState<string>("");
    const [shippingAddress2, setShippingAddress2] = useState<string>("");
    const [state, setState] = useState<string>("");
    const [city, setCity] = useState<string>("");
    const [orderStatus, setOrderStatus] = useState<string>("");
    const [zipCode, setZipCode] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [phone, setPhone] = useState<string>("");
    const [subTotal, setSubTotal] = useState<string>("");
    const [shipping, setShipping] = useState<string>("");
    const [tax, setTax] = useState<string>("");
    const [total, setTotal] = useState<string>("");
    const [items, setItems] = useState<IAVOrderItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [isConfirming, setIsConfirming] = useState<boolean>(false);
    const [status, setStatus] = useState<"loading" | "success" | "failure">(
        "loading"
    );
    const [someBackOrdered, setSomeBackOrdered] = useState<boolean>(false);
    const [notReadyToShip, setNotReadyToShip] = useState<boolean>(false);
    const [emailHelperText, setEmailHelperText] = useState<string>("");
    const [error, setError] = useState<null | string>(null);
    const authContext = useContext(AuthContext);
    const accessLevel = authContext?.user?.accessLevel;
    const taxRate = 0.06;
    const navigate = useNavigate();
    const orderStatusOptions = [
        "in process",
        "ready to ship",
        "shipped",
        "delivered",
        "cancelled",
        "back ordered",
    ];

    const limitedStatusOptions = ["in process", "cancelled"];
    const backOrderedStatusOptions = ["cancelled", "back ordered"];

    useEffect(() => {
        if (orderNo) {
            dispatch(avFetchOrderDetails({ orderNo, force: true }));
        }
    }, [orderNo]);

    useEffect(() => {
        if (editMode && accessLevel === "view only") {
            searchParams.set("editing", "false");
            setSearchParams(searchParams);
        }
    }, [editMode]);

    useEffect(() => {
        if (avOrderDetails) {
            const orderDetails: IAVOrderDetails = avOrderDetails.details;
            const deepCopiedOrderDetails = JSON.parse(
                JSON.stringify(orderDetails)
            );
            const doubleDeepCopiedOrderDetails = JSON.parse(
                JSON.stringify(deepCopiedOrderDetails)
            );
            setCurrentDetails(deepCopiedOrderDetails);
            setState(doubleDeepCopiedOrderDetails.stateAbbr);
            const splitAddress =
                doubleDeepCopiedOrderDetails.shippingAddress.split(" | ");
            setShippingAddress1(splitAddress[0]);
            if (splitAddress[1]) {
                setShippingAddress2(splitAddress[1]);
            }
            setOrderStatus(doubleDeepCopiedOrderDetails.orderStatus);
            setEmail(doubleDeepCopiedOrderDetails.email);
            setZipCode(doubleDeepCopiedOrderDetails.zipCode);
            setPhone(doubleDeepCopiedOrderDetails.phoneNumber);
            setItems([...doubleDeepCopiedOrderDetails.OrderItem]);
            setShipping(doubleDeepCopiedOrderDetails.shipping);
            setTotal(doubleDeepCopiedOrderDetails.totalAmount);
            setSubTotal(doubleDeepCopiedOrderDetails.subTotal);
            setTax(doubleDeepCopiedOrderDetails.tax);
            setCity(doubleDeepCopiedOrderDetails.city);

            setLoading(false);
        }
    }, [avOrderDetails]);

    const handleShippingInput = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        setAction: React.Dispatch<SetStateAction<string>>
    ) => {
        const regex = new RegExp("^\\d*\\.?\\d{0,2}$");
        const { value } = event.target;
        if (regex.test(value) || value === "") {
            event.target.value = value;
            setAction(value);
        } else {
            event.target.value = value.slice(0, -1);
        }
    };

    const handleShippingBlur = (
        event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
        setAction: React.Dispatch<SetStateAction<string>>
    ) => {
        const { value } = event.currentTarget;
        const newValue =
            Number(value) > 0 ? String(Number(value).toFixed(2)) : "";
        setAction(newValue);
        setTax(String(((+subTotal + +shipping) * 0.06).toFixed(2)));
        setTotal(String((+subTotal + +tax + +shipping).toFixed(2)));
        event.currentTarget.value = newValue;
    };

    const handleEmailBlur = (
        event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { value } = event.target;
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (emailRegex.test(value)) {
            console.log("valid");
            setEmailHelperText("");
        } else {
            console.log("invalid");
            setEmailHelperText("Please enter a valid email address");
        }
    };

    const handleSetSubtotal = (newSubtotal: number) => {
        setSubTotal(newSubtotal.toFixed(2));
        const newTax = ((newSubtotal + +shipping) * 0.06).toFixed(2);
        setTax(newTax);
        setTotal((newSubtotal + +shipping + +newTax).toFixed(2));
    };

    const handleCancel = () => {
        if (currentDetails) {
            setState(currentDetails.stateAbbr);
            const splitAddress = currentDetails.shippingAddress.split(" | ");
            setShippingAddress1(splitAddress[0]);
            if (splitAddress[1]) {
                setShippingAddress2(splitAddress[1]);
            }
            setOrderStatus(currentDetails.orderStatus);
            setEmail(currentDetails.email);
            setZipCode(currentDetails.zipCode);
            setPhone(currentDetails.phoneNumber);
            setItems([...currentDetails.OrderItem]);
            setShipping(currentDetails.shipping);
            setTotal(currentDetails.totalAmount);
            setSubTotal(currentDetails.subTotal);
            setTax(currentDetails.tax);
            setCity(currentDetails.city);
        } else {
            if (orderNo) dispatch(avFetchOrderDetails({ orderNo }));
        }
        searchParams.delete("editing");
        setSearchParams(searchParams);
    };

    useEffect(() => {
        let processing: boolean = false;
        let cancelled: boolean = false;
        let ready: boolean = false;
        let backOrdered: boolean = false;
        let numberCancelled: number = 0;
        let numberFulfilled: number = 0;
        for (const item of items) {
            if (item.fulfillmentStatus !== "fulfilled") {
                if (item.fulfillmentStatus === "cancelled") {
                    numberCancelled++;
                    if (numberCancelled === items.length) {
                        cancelled = true;
                    } else {
                        cancelled = false;
                    }
                } else if (item.fulfillmentStatus === "back ordered") {
                    backOrdered = true;
                } else {
                    processing = true;
                }
            } else {
                numberFulfilled++;
                if (
                    numberFulfilled !== 0 &&
                    numberFulfilled + numberCancelled === items.length
                ) {
                    ready = true;
                }
            }
        }
        if (cancelled) {
            setOrderStatus("cancelled");
            setNotReadyToShip(true);
            if (backOrdered) {
                setSomeBackOrdered(true);
            } else {
                setSomeBackOrdered(false);
            }
        } else if (backOrdered) {
            setOrderStatus("back ordered");
            setNotReadyToShip(true);
            setSomeBackOrdered(true);
        } else if (processing) {
            setOrderStatus("in process");
            setNotReadyToShip(true);
            setSomeBackOrdered(false);
        } else if (
            ready &&
            (orderStatus === "in process" ||
                orderStatus === "cancelled" ||
                orderStatus === "back ordered")
        ) {
            setOrderStatus("ready to ship");
            setNotReadyToShip(false);
            setSomeBackOrdered(false);
        }
    }, [items]);

    useEffect(() => {
        if (orderStatus === "cancelled") {
            let newItemArray = [...items];
            for (const item of newItemArray) {
                item.fulfillmentStatus = "cancelled";
            }
            setItems(newItemArray);
            setSubTotal("0.00");
            setTax("0.00");
            setShipping("0.00");
            setTotal("0.00");
        } else {
            let subT = 0;
            for (const item of items) {
                if (item.fulfillmentStatus !== "cancelled") {
                    subT += +item.priceWhenOrdered * +item.quantity;
                }
            }
            setSubTotal(subT.toFixed(2));
            if (subT !== 0) {
                setShipping("9.99");
                setTax(((subT + 9.99) * 0.06).toFixed(2));
                setTotal(((subT + 9.99) * 1.06).toFixed(2));
            } else {
                setShipping("0.00");
                setTax("0.00");
                setTotal("0.00");
            }
        }
    }, [orderStatus]);

    const handleSave = useCallback(async () => {
        setIsConfirming(false);
        setIsSaving(true);
        let thereAreChanges: boolean = false;
        console.log(orderStatus);
        const updateInfo: Record<
            string,
            | string
            | number
            | Array<{
                  order_item_id: number;
                  quantity: number;
                  fulfillmentStatus: string;
              }>
        > = {
            orderNo: orderNo as string,
        };
        const orderParams: Array<keyof IAVOrderDetails> = [
            "subTotal",
            "shipping",
            "tax",
            "city",
            "zipCode",
            "email",
        ];

        if (currentDetails) {
            const itemUpdates: Array<{
                order_item_id: number;
                quantity: number;
                fulfillmentStatus: string;
            }> = [];
            let isOrderCancelled: boolean = true;
            let isOrderShipped: boolean = true;
            let isOrderBackOrdered: boolean = true;
            let isOrderReadyToShip: boolean = true;
            for (const item of items) {
                const originalItem = currentDetails.OrderItem.filter(
                    (orig) => orig.order_item_id === item.order_item_id
                )[0];
                if (item.fulfillmentStatus !== "cancelled")
                    isOrderCancelled = false;
                if (item.fulfillmentStatus !== "shipped")
                    isOrderShipped = false;
                if (item.fulfillmentStatus !== "back ordered")
                    isOrderBackOrdered = false;
                if (item.fulfillmentStatus !== "fulfilled")
                    isOrderReadyToShip = false;

                if (
                    item.quantity !== originalItem.quantity ||
                    item.fulfillmentStatus !== originalItem.fulfillmentStatus
                ) {
                    thereAreChanges = true;
                    const itemToAdd = {
                        order_item_id: item.order_item_id,
                        quantity: item.quantity,
                        fulfillmentStatus: item.fulfillmentStatus,
                    };
                    itemUpdates.push(itemToAdd);
                }
            }

            let newOrderStatus = orderStatus;
            if (isOrderCancelled) {
                newOrderStatus = "cancelled";
                setOrderStatus("cancelled");
            }
            if (isOrderShipped) {
                newOrderStatus = "shipped";
                setOrderStatus("shipped");
            }
            if (isOrderBackOrdered) {
                newOrderStatus = "back ordered";
                setOrderStatus("back ordered");
            }
            if (
                isOrderReadyToShip &&
                !["shipped", "delivered"].includes(newOrderStatus)
            ) {
                newOrderStatus = "ready to ship";
                setOrderStatus("ready to ship");
            }

            updateInfo["items"] = itemUpdates;

            for (const key of orderParams) {
                if (eval(key) && eval(key) !== currentDetails[key]) {
                    thereAreChanges = true;
                    if (["subTotal", "tax", "shipping"].includes(key)) {
                        updateInfo[key] = +eval(key);
                    } else {
                        updateInfo[key] = eval(key);
                    }
                } else {
                    updateInfo[key] = currentDetails[key] as string;
                }
            }

            console.log(newOrderStatus, currentDetails.orderStatus);
            if (
                newOrderStatus &&
                newOrderStatus !== currentDetails.orderStatus
            ) {
                updateInfo["orderStatus"] = newOrderStatus;
                thereAreChanges = true;
            } else {
                updateInfo["orderStatus"] = currentDetails.orderStatus;
            }

            if (subTotal && subTotal !== currentDetails.subTotal) {
                updateInfo["subTotal"] = +subTotal;
                thereAreChanges = true;
            } else {
                updateInfo["subTotal"] = +currentDetails.subTotal;
            }

            if (total && total !== currentDetails.totalAmount) {
                updateInfo["totalAmount"] = +total;
                thereAreChanges = true;
            } else {
                updateInfo["totalAmount"] = +currentDetails.totalAmount;
            }

            if (state && state !== currentDetails.stateAbbr) {
                updateInfo["stateAbbr"] = state;
                thereAreChanges = true;
            } else {
                updateInfo["stateAbbr"] = currentDetails.stateAbbr;
            }

            if (phone && phone !== currentDetails.phoneNumber) {
                updateInfo["phoneNumber"] = phone;
                thereAreChanges = true;
            } else {
                updateInfo["phoneNumber"] = currentDetails.phoneNumber;
            }

            const newShippingAddress = `${shippingAddress1} | ${shippingAddress2}`;
            if (
                newShippingAddress !== " | " &&
                newShippingAddress !== currentDetails.shippingAddress
            ) {
                updateInfo["shippingAddress"] = newShippingAddress;
                thereAreChanges = true;
            } else {
                updateInfo["shippingAddress"] = currentDetails.shippingAddress;
            }
        }
        if (thereAreChanges) {
            const token = localStorage.getItem("jwtToken");
            console.log("updateInfo:", updateInfo);
            try {
                const response = await axios.put(
                    `${import.meta.env.VITE_API_URL}/order/update`,
                    updateInfo,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                        },
                    }
                );
                setStatus("success");
                searchParams.delete("editing");
                setSearchParams(searchParams);
            } catch (error) {
                if (error instanceof AxiosError) {
                    setError(error.message);
                }
                setStatus("failure");
                console.error("Error uploading files:", error);
            } finally {
                dispatch(
                    avFetchOrderDetails({
                        orderNo: orderNo as string,
                        force: true,
                    })
                );
            }
        } else {
            console.log("no changes");
            setIsSaving(false);
        }
    }, [
        orderNo,
        orderStatus,
        currentDetails,
        total,
        state,
        phone,
        shippingAddress1,
        shippingAddress2,
        items,
        searchParams,
        setSearchParams,
    ]);

    const handleTelInputChange = (value: string, info: any) => {
        setPhone(value);
    };

    return (
        <React.Fragment>
            {!loading && currentDetails && (
                <Container
                    sx={{
                        pl: { xs: 3, sm: 0, md: 2 },
                        pr: { xs: 3, sm: 0, md: 2 },
                    }}
                >
                    <Grid
                        container
                        spacing={3}
                        mt={3}
                        sx={{ width: "calc(100% + 24px)" }}
                    >
                        <Grid
                            container
                            item
                            sx={{
                                justifyContent: "space-between",
                            }}
                            xs={12}
                        >
                            <Grid
                                item
                                xs={12}
                                md={6}
                                sx={{
                                    order: {
                                        xs: 2,
                                        md: 1,
                                    },
                                }}
                            >
                                <h1
                                    style={{
                                        marginBottom: "15px",
                                        marginTop: 0,
                                    }}
                                >
                                    Order #{orderNo?.toLowerCase()}
                                </h1>
                            </Grid>
                            <Grid
                                item
                                container
                                xs={12}
                                md={6}
                                spacing={1}
                                sx={{
                                    justifyContent: "flex-end",
                                    alignItems: "flex-start",
                                    order: {
                                        xs: 1,
                                        md: 2,
                                    },
                                }}
                            >
                                <Grid
                                    item
                                    container
                                    xs={12}
                                    sx={{
                                        justifyContent: {
                                            xs: "space-between",
                                            md: "flex-end",
                                        },
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        onClick={() =>
                                            navigate("/orders/manage")
                                        }
                                        sx={{
                                            color: "black",
                                            marginBottom: "20px",
                                        }}
                                    >
                                        &lt; Back
                                    </Button>

                                    {editMode && (
                                        <div>
                                            <Button
                                                variant="contained"
                                                onClick={() =>
                                                    setIsConfirming(true)
                                                }
                                                sx={{
                                                    marginLeft: "20px",
                                                    marginBottom: "20px",
                                                }}
                                            >
                                                Save
                                            </Button>
                                            <Button
                                                sx={{
                                                    marginLeft: "20px",
                                                    marginBottom: "20px",
                                                }}
                                                variant="contained"
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </Button>
                                        </div>
                                    )}
                                    {!editMode &&
                                        accessLevel !== "view only" && (
                                            <Button
                                                variant="contained"
                                                onClick={() => {
                                                    searchParams.set(
                                                        "editing",
                                                        "true"
                                                    );
                                                    setSearchParams(
                                                        searchParams
                                                    );
                                                }}
                                                sx={{
                                                    marginLeft: "20px",
                                                    marginBottom: "20px",
                                                }}
                                            >
                                                Edit
                                            </Button>
                                        )}
                                </Grid>
                            </Grid>
                            <Grid
                                container
                                item
                                xs={12}
                                sx={{
                                    justifyContent: "space-between",
                                    order: 3,
                                }}
                            >
                                <Grid item xs={6}>
                                    <div className="date">
                                        <span style={{ fontWeight: 700 }}>
                                            Order Date
                                        </span>
                                        <span>
                                            {dayjs(
                                                currentDetails.orderDate
                                            ).format("DD MMMM, YYYY")}
                                        </span>
                                        <span>
                                            {dayjs(
                                                currentDetails.orderDate
                                            ).format("HH:mm:ss")}
                                        </span>
                                    </div>
                                </Grid>
                                <Grid item xs={6}>
                                    <div
                                        style={{
                                            display: "flex",
                                            justifyContent: "flex-end",
                                            alignItems: "flex-end",
                                        }}
                                    >
                                        <div></div>
                                        <div
                                            style={{
                                                maxWidth: "300px",
                                                width: "100%",
                                            }}
                                        >
                                            <SelectFieldNonFormik
                                                label="Order Status"
                                                name="orderStatus"
                                                readOnly={
                                                    editMode ? false : true
                                                }
                                                multiple={false}
                                                required={
                                                    editMode ? true : false
                                                }
                                                options={orderStatusOptions}
                                                sx={
                                                    editMode
                                                        ? inputStyle
                                                        : readOnlyStyle
                                                }
                                                setAction={setOrderStatus}
                                                value={orderStatus}
                                                variant={
                                                    editMode
                                                        ? "filled"
                                                        : "standard"
                                                }
                                                optionsToStayEnabled={
                                                    someBackOrdered
                                                        ? backOrderedStatusOptions
                                                        : limitedStatusOptions
                                                }
                                                someOptionsDisabled={
                                                    notReadyToShip ||
                                                    someBackOrdered
                                                }
                                            />
                                        </div>
                                    </div>
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid container item xs={12} lg={8} rowSpacing={3}>
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
                                    required={false}
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
                                <Grid item xs={5}>
                                    <TextField
                                        fullWidth
                                        variant={
                                            editMode ? "filled" : "standard"
                                        }
                                        id="city"
                                        label="City"
                                        required={editMode}
                                        inputProps={{
                                            sx: editMode
                                                ? { backgroundColor: "white" }
                                                : undefined,
                                            readOnly: editMode ? false : true,
                                        }}
                                        sx={
                                            editMode
                                                ? inputStyle
                                                : readOnlyStyle
                                        }
                                        value={city}
                                    />
                                </Grid>
                                <Grid item xs={3}>
                                    <TextField
                                        fullWidth
                                        variant={
                                            editMode ? "filled" : "standard"
                                        }
                                        id="state"
                                        label="State"
                                        required={editMode}
                                        inputProps={{
                                            pattern: "^[A-Za-z]{2}$",
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
                                <Grid item xs={4}>
                                    <TextField
                                        fullWidth
                                        variant={
                                            editMode ? "filled" : "standard"
                                        }
                                        id="zipcode"
                                        label="Zip Code"
                                        required={editMode}
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
                                spacing={3}
                                sx={{ display: "flex", flexWrap: "wrap" }}
                                item
                                xs={12}
                                container
                            >
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        variant={
                                            editMode ? "filled" : "standard"
                                        }
                                        id="email"
                                        label="email"
                                        required={editMode}
                                        inputProps={{
                                            sx: editMode
                                                ? {
                                                      backgroundColor:
                                                          emailHelperText
                                                              ? "#f58e90"
                                                              : "white !important",
                                                  }
                                                : undefined,
                                            readOnly: editMode ? false : true,
                                        }}
                                        sx={
                                            editMode
                                                ? {
                                                      ...inputStyle,
                                                      "& .MuiFormHelperText-root":
                                                          {
                                                              color: "red",
                                                          },
                                                  }
                                                : readOnlyStyle
                                        }
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        onBlur={(e) => handleEmailBlur(e)}
                                        helperText={
                                            emailHelperText
                                                ? emailHelperText
                                                : ""
                                        }
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <MuiTelInput
                                        id="phone"
                                        name="phoneNumber"
                                        autoComplete="tel"
                                        fullWidth
                                        value={phone}
                                        onChange={handleTelInputChange}
                                        required={editMode}
                                        defaultCountry="US"
                                        forceCallingCode
                                        inputProps={{
                                            readOnly: editMode ? false : true,
                                            sx: editMode
                                                ? {
                                                      backgroundColor:
                                                          "white !important",
                                                  }
                                                : undefined,
                                        }}
                                        variant={
                                            editMode ? "filled" : "standard"
                                        }
                                        sx={
                                            editMode
                                                ? inputStyle
                                                : readOnlyStyle
                                        }
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item xs={0} lg={1}></Grid>
                        <Grid spacing={3} item xs={12} lg={3} container>
                            <Grid
                                item
                                xs={12}
                                // sx={{ paddingLeft: { xs: "24px", md: "48px" } }}
                            >
                                <TextField
                                    fullWidth
                                    variant={editMode ? "filled" : "standard"}
                                    id="subtotal"
                                    label="Subtotal"
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
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    variant={editMode ? "filled" : "standard"}
                                    id="shippingCost"
                                    label="Shipping"
                                    required={editMode}
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
                                    value={
                                        subTotal !== "0.00" ? shipping : "0.00"
                                    }
                                    onChange={(e) =>
                                        handleShippingInput(e, setShipping)
                                    }
                                    onBlur={(e) =>
                                        handleShippingBlur(e, setShipping)
                                    }
                                />
                            </Grid>
                            <Grid item xs={12}>
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
                                    value={subTotal !== "0.00" ? tax : "0.00"}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    variant={editMode ? "filled" : "standard"}
                                    id="total"
                                    label="Total"
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
                                    value={subTotal !== "0.00" ? total : "0.00"}
                                />
                            </Grid>
                        </Grid>
                        <Grid item xs={12}>
                            <AVOrderItemList
                                orderItems={items}
                                setOrderItems={setItems}
                                handleSetSubtotal={handleSetSubtotal}
                                subTotal={+subTotal}
                                editMode={editMode}
                            />
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
                                    onClick={handleSave}
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
