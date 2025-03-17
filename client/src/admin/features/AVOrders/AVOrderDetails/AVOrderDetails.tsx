import React, { useState, useEffect } from "react";
import { Grid2 as Grid, Container } from "@mui/material";
import "./av-order-details.css";
import { useSearchParams } from "react-router-dom";
import StatusPopup from "../../../../common/components/StatusPopup";
import { IAVOrderItem, IAVOrderDetails } from "../avOrdersTypes";
import AVOrderItemList from "./components/AVOrderITemList/AVOrderItemList";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { RootState } from "../../../store/store";
import { avFetchOrderDetails } from "../avOrdersSlice";
import useManageOrderStatusSync from "./hooks/useManageOrderStatus";
import useOrderEventHandlers from "./hooks/useOrderEventHandlers";
import useSaveOrder from "./hooks/useSaveOrder";
import AVOrderDetailsHeader from "./components/AVOrderDetailsHeader";
import AVOrderShippingDetails from "./components/AVOrderShippingDetails";
import AVOrderPriceDetails from "./components/AVOrderPriceDetails";
import AVOrderConfirm from "./components/AVOrderConfirm";

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

    // Local states
    const [city, setCity] = useState<string>("");
    const [currentDetails, setCurrentDetails] =
        useState<IAVOrderDetails | null>(null);
    const [email, setEmail] = useState<string>("");
    const [emailHelperText, setEmailHelperText] = useState<string>("");
    const [error, setError] = useState<null | string>(null);
    const [isConfirming, setIsConfirming] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [items, setItems] = useState<IAVOrderItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [phone, setPhone] = useState<string>("");
    const [shipping, setShipping] = useState<string>("");
    const [shippingAddress1, setShippingAddress1] = useState<string>("");
    const [shippingAddress2, setShippingAddress2] = useState<string>("");
    const [state, setState] = useState<string>("");
    const [status, setStatus] = useState<"loading" | "success" | "failure">(
        "loading"
    );
    const [subTotal, setSubTotal] = useState<string>("");
    const [tax, setTax] = useState<string>("");
    const [total, setTotal] = useState<string>("");
    const [zipCode, setZipCode] = useState<string>("");

    // Custom hook invocations
    const { orderStatus, setOrderStatus, notReadyToShip, someBackOrdered } =
        useManageOrderStatusSync({ items });
    const { handleShippingInput, handleShippingBlur, handleEmailBlur } =
        useOrderEventHandlers({
            shipping,
            setShipping,
            tax,
            setTax,
            setTotal,
            setEmailHelperText,
            subTotal,
        });
    const { handleSave } = useSaveOrder({
        city,
        currentDetails,
        email,
        items,
        orderNo,
        orderStatus,
        setOrderStatus,
        phone,
        searchParams,
        setSearchParams,
        setError,
        setIsConfirming,
        setIsSaving,
        setStatus,
        shipping,
        shippingAddress1,
        shippingAddress2,
        state,
        subTotal,
        tax,
        total,
        zipCode,
    });

    const toggleEditMode = (state: "on" | "off") => {
        if (state === "on") {
            searchParams.set("editing", "true");
            setSearchParams(searchParams);
        } else {
            searchParams.delete("editing");
            setSearchParams(searchParams);
        }
    };

    // If an order number exists in searchParams (which it always should), dispatch a fetch request for order details.

    useEffect(() => {
        if (orderNo) {
            dispatch(avFetchOrderDetails({ orderNo, force: true }));
        }
    }, [orderNo]);

    // Once slice updates with fetched order details, update local states.
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

    // When user changes order status to cancelled, set order total and related values to 0 and set every order item to cancelled.
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
            // When user changes order status from cancelled to something else, recalculate order total and related values based on currently non-cancelled items.
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

    // Update subtotal and recalculate tax and new total.
    const handleSetSubtotal = (newSubtotal: number) => {
        setSubTotal(newSubtotal.toFixed(2));
        const newTax = ((newSubtotal + +shipping) * 0.06).toFixed(2);
        setTax(newTax);
        setTotal((newSubtotal + +shipping + +newTax).toFixed(2));
    };

    // When exiting edit mode without saving (cancel changes), reset all values to those currently stored in slice.
    // If those values have been erased from the slice for any reason, dispatch a fetch call to re-retrieve order details, which will trigger the useEffect above that updates local values.
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

    return (
        <React.Fragment>
            {!loading && currentDetails && (
                <Container
                    sx={{
                        pl: { xs: 1, sm: 0, md: 2 },
                        pr: { xs: 4, sm: 2 },
                    }}
                >
                    <Grid
                        container
                        spacing={3}
                        mt={3}
                        sx={{ width: "calc(100% + 24px)" }}
                    >
                        <AVOrderDetailsHeader
                            currentDetails={currentDetails}
                            editMode={editMode}
                            handleCancel={handleCancel}
                            notReadyToShip={notReadyToShip}
                            orderNo={orderNo}
                            orderStatus={orderStatus}
                            setOrderStatus={setOrderStatus}
                            setIsConfirming={setIsConfirming}
                            someBackOrdered={someBackOrdered}
                            toggleEditMode={toggleEditMode}
                        />
                        <AVOrderShippingDetails
                            editMode={editMode}
                            shippingAddress1={shippingAddress1}
                            setShippingAddress1={setShippingAddress1}
                            shippingAddress2={shippingAddress2}
                            setShippingAddress2={setShippingAddress2}
                            city={city}
                            setCity={setCity}
                            state={state}
                            setState={setState}
                            zipCode={zipCode}
                            setZipCode={setZipCode}
                            email={email}
                            setEmail={setEmail}
                            emailHelperText={emailHelperText}
                            handleEmailBlur={handleEmailBlur}
                            phone={phone}
                            setPhone={setPhone}
                        />
                        <Grid
                            size={{
                                xs: 0,
                                lg: 1,
                            }}
                        ></Grid>
                        <AVOrderPriceDetails
                            editMode={editMode}
                            subTotal={subTotal}
                            shipping={shipping}
                            handleShippingInput={handleShippingInput}
                            handleShippingBlur={handleShippingBlur}
                            setShipping={setShipping}
                            tax={tax}
                            total={total}
                        />
                        <Grid size={12}>
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
                        <AVOrderConfirm
                            currentDetails={currentDetails}
                            handleSave={handleSave}
                            setIsConfirming={setIsConfirming}
                            toggleEditMode={toggleEditMode}
                        />
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
