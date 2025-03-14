import { useState, useEffect, useCallback, SetStateAction } from "react";
import {
    IAVOrderDetails,
    IAVOrderItem,
    OrderStatus,
} from "../../avOrdersTypes";
import axios from "axios";
import { axiosLogAndSetState } from "../../../../../common/utils/axiosLogAndSetState";
import { useAppDispatch } from "../../../../hooks/reduxHooks";
import { avFetchOrderDetails } from "../../avOrdersSlice";

interface SaveOrderProps {
    city: string;
    currentDetails: IAVOrderDetails | null;
    email: string;
    items: IAVOrderItem[];
    orderNo: string | null;
    orderStatus: OrderStatus;
    setOrderStatus: React.Dispatch<SetStateAction<OrderStatus>>;
    phone: string;
    searchParams: URLSearchParams;
    setSearchParams: React.Dispatch<SetStateAction<URLSearchParams>>;
    setError: React.Dispatch<SetStateAction<string | null>>;
    setIsConfirming: React.Dispatch<SetStateAction<boolean>>;
    setIsSaving: React.Dispatch<SetStateAction<boolean>>;
    setStatus: React.Dispatch<
        SetStateAction<"loading" | "success" | "failure">
    >;
    shipping: string;
    shippingAddress1: string;
    shippingAddress2: string;
    state: string;
    subTotal: string;
    tax: string;
    total: string;
    zipCode: string;
}

interface SaveOrder {
    handleSave: () => void;
}

function useSaveOrder({
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
}: SaveOrderProps): SaveOrder {
    const dispatch = useAppDispatch();

    const handleSave = useCallback(async () => {
        setIsConfirming(false);
        setIsSaving(true);
        let thereAreChanges: boolean = false;
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

            const valMap: Record<string, any> = {
                subTotal,
                shipping,
                tax,
                city,
                zipCode,
                email,
            };

            for (const key of orderParams) {
                if (valMap[key] && valMap[key] !== currentDetails[key]) {
                    thereAreChanges = true;
                    if (["subTotal", "tax", "shipping"].includes(key)) {
                        updateInfo[key] = +valMap[key];
                    } else {
                        updateInfo[key] = valMap[key];
                    }
                } else {
                    if (["subTotal", "tax", "shipping"].includes(key)) {
                        updateInfo[key] = Number(currentDetails[key]);
                    } else {
                        updateInfo[key] = currentDetails[key] as string;
                    }
                }
            }

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
            try {
                await axios.put(
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
                axiosLogAndSetState(error, setError, "uploading changes");
                setStatus("failure");
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

    return { handleSave };
}

export default useSaveOrder;
