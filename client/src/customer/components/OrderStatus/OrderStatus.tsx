import React, { useContext, useEffect } from "react";
import { useState } from "react";
import axios, { AxiosError } from "axios";
import StatusStepper from "./OrderDetails/StatusStepper";
import "./order-status.css";
import OrderLookup from "./OrderLookup/OrderLookup";
import OrderDetails from "./OrderDetails/OrderDetails";
import { AuthContext } from "../../../common/contexts/authContext";
import { useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/customerStore";
import { CircularProgress } from "@mui/material";

export interface Product {
    id: number;
    productNo: string;
    productName: string;
    price: number;
    description: string;
    category_id: number;
    subcategory_id?: number;
    thumbnailUrl?: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
}
export interface OrderItem {
    order_item_id: number;
    order_id: number;
    productNo: string;
    Product: Product;
    quantity: number;
    priceWhenOrdered: number;
    fulfillmentStatus: string;
}
export interface IOrderDetails {
    order_id: number;
    customerId: number | null;
    orderNo: string;
    orderDate: Date;
    subTotal: number;
    shipping: number;
    city: string;
    tax: number;
    totalAmount: number;
    shippingAddress: string;
    stateAbbr: string;
    zipCode: string;
    phoneNumber: string;
    email: string;
    orderStatus:
        | "in process"
        | "ready to ship"
        | "delivered"
        | "shipped"
        | "delivered"
        | "cancelled";
    OrderItem: OrderItem[];
}

interface Props {}
const OrderStatus: React.FC<Props> = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [orderDetails, setOrderDetails] = useState<IOrderDetails | null>(
        null
    );
    const orderNo = useAppSelector(
        (state: RootState) => state.userData.data.currentOrderNo
    );
    const auth = useContext(AuthContext);
    const loggedIn = auth && auth.user && !auth.isTokenExpired();

    const token = localStorage.getItem("jwtToken");
    const fetchOrderDetails = async (data: {
        orderNo: string;
        email?: string;
    }) => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/order/${
                    loggedIn && orderNo ? "customer/" : ""
                }${data.orderNo}`,
                {
                    params: {
                        email: data.email ? data.email : undefined,
                    },

                    headers: {
                        "Content-Type": "multipart/form-data",
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            setOrderDetails(response.data);
            console.log(response.data);
        } catch (error) {
            if (error instanceof AxiosError) {
                console.log(error.response?.data.reason);
                setError(
                    error.response?.data.reason ||
                        "Unable to find specified order."
                );
                console.error("Error fetching order:", error);
            } else {
                setError(
                    "Something went wrong while looking up your order. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (orderNo && loggedIn) {
            fetchOrderDetails({ orderNo });
        }
    }, [orderNo]);

    useEffect(() => {
        if (!loggedIn) {
            setOrderDetails(null);
        }
    }, [auth]);

    return (
        <div className="track-order">
            {!orderDetails && !loggedIn && (
                <OrderLookup
                    onSubmit={fetchOrderDetails}
                    error={error}
                    loading={loading}
                />
            )}
            {!orderDetails && loggedIn && <CircularProgress />}
            {orderDetails && <OrderDetails orderDetails={orderDetails} />}
        </div>
    );
};
export default OrderStatus;
