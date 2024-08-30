import {
    CircularProgress,
    FormControl,
    Table,
    TableBody,
    TableCell,
    TableFooter,
    TableHead,
    TableRow,
    TextField,
} from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";
import PeachButton from "../../../common/components/PeachButton";
import axios, { AxiosError } from "axios";
import StatusStepper from "./StatusStepper";
import "./order-status.css";

interface Product {
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
interface OrderItem {
    order_item_id: number;
    order_id: number;
    productNo: string;
    Product: Product;
    quantity: number;
    priceWhenOrdered: number;
    fulfillmentStatus: string;
}
interface OrderDetails {
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
        | "delivered";
    OrderItem: OrderItem[];
}

interface Props {
    orderNumber?: string;
}
const OrderStatus: React.FC<Props> = ({ orderNumber }) => {
    const [orderNo, setOrderNo] = useState<string | null>(null);
    const [formData, setFormData] = useState<{
        orderNo: string;
        email: string;
    }>({ orderNo: "", email: "" });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
    const [splitShippingAddress, setSplitShippingAddress] = useState<string[]>([
        "",
        "",
    ]);
    const [formattedDate, setFormattedDate] = useState<string>("");

    useEffect(() => {
        if (orderNumber) {
            setOrderNo(orderNumber);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const token = localStorage.getItem("jwtToken");
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/order/${formData.orderNo}`,
                {
                    params: { email: formData.email },

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
                setError(error.message);
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

    let activeStep: number = 0;

    useEffect(() => {
        if (orderDetails) {
            switch (orderDetails.orderStatus) {
                case "in process":
                    activeStep = 0;
                    break;
                case "ready to ship":
                    activeStep = 1;
                    break;
                case "shipped":
                    activeStep = 2;
                    break;
                case "delivered":
                    activeStep = 3;
                    break;
                default:
                    activeStep = 0;
            }
            setSplitShippingAddress(orderDetails.shippingAddress.split(" | "));
            const date = new Date(orderDetails.orderDate);

            const options: Intl.DateTimeFormatOptions = {
                year: "numeric",
                month: "long",
                day: "numeric",
            };
            setFormattedDate(date.toLocaleDateString("en-US", options));
        }
    }, [orderDetails]);

    const steps = [
        {
            label: "In Process",
            description:
                "We've received your order, and we're working hard to get it to you as soon as possible. Our team members are gathering the products you ordered to prepare them for shipping.",
        },
        {
            label: "Ready to Ship",
            description:
                "Your order is assembled and ready to send out. It'll be on it's way to you before you know it. You'll receive an email notifying you when your order has shipped.",
        },
        {
            label: "Shipped",
            description:
                "Your order is on its way! We can't wait for you to be able to enjoy our products.",
        },
        {
            label: "Delivered",
            description:
                "Your order has been delivered! We hope you love every product you got. If not, contact us as soon as possible so that we can get you a replacement or refund. Nothing but the best for our customers!",
        },
    ];

    return (
        <div>
            {!orderDetails && (
                <div className="enter-order-number-dialog">
                    <div className="track-order-text">
                        <h1>Track Order</h1>
                        {!error && (
                            <p>
                                Track your order by entering your order number
                                and the email associated with the order below.
                            </p>
                        )}
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                    <form onSubmit={handleSubmit}>
                        <FormControl>
                            <div className="enter-orderNo">
                                <TextField
                                    required
                                    label="Order Number"
                                    name="orderNo"
                                    value={formData.orderNo}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="enter-email">
                                <TextField
                                    required
                                    label="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <PeachButton
                                text="VIEW ORDER"
                                type="submit"
                                onClick={() => {}}
                            />
                        </FormControl>
                    </form>
                    {loading && <CircularProgress />}
                </div>
            )}
            {orderDetails && (
                <div className="order-details-container">
                    <div className="order-status-header">
                        <h1>Order #{orderDetails.orderNo.toLowerCase()}</h1>
                        <span>Order Date: {formattedDate}</span>
                    </div>
                    <StatusStepper orderStatus={orderDetails.orderStatus} />
                    <div className="order-details">
                        <p className="status-summary">
                            {steps[activeStep].description}
                        </p>
                        <div className="shipping-billing-details">
                            <span>{splitShippingAddress[0]}</span>
                            {splitShippingAddress[1] !== "" && (
                                <span>{splitShippingAddress[1]}</span>
                            )}
                            <span>
                                {orderDetails.city}, {orderDetails.stateAbbr}
                            </span>
                            <span>{orderDetails.zipCode}</span>
                        </div>
                    </div>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell></TableCell>
                                <TableCell>Product No.</TableCell>
                                <TableCell>Item</TableCell>
                                <TableCell>Quantity</TableCell>
                                <TableCell>Price</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {orderDetails.OrderItem.map((item, index) => (
                                <TableRow
                                    key={item.Product.productName}
                                    sx={
                                        index !==
                                        orderDetails.OrderItem.length - 1
                                            ? {
                                                  "& td, & th": { border: 0 },
                                              }
                                            : {}
                                    }
                                >
                                    <TableCell>
                                        <img
                                            src={`${item.Product.thumbnailUrl}_140.webp`}
                                            alt={item.Product.productName}
                                            className="order-status-thumbnail"
                                            width="40px"
                                            height="40px"
                                            loading="lazy"
                                        />
                                    </TableCell>
                                    <TableCell>{item.productNo}</TableCell>
                                    <TableCell component="th" scope="row">
                                        {item.Product.productName}
                                    </TableCell>
                                    <TableCell>{item.quantity}</TableCell>
                                    <TableCell align="right">
                                        ${item.priceWhenOrdered}
                                    </TableCell>
                                </TableRow>
                            ))}
                            <TableRow
                                sx={{
                                    "& td, & th": { border: 0 },
                                }}
                            >
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell></TableCell>
                                <TableCell>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        <span>SubTotal</span>
                                        <span>Shipping</span>
                                        <span>Tax</span>
                                        <span>Total</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div
                                        style={{
                                            display: "flex",
                                            flexDirection: "column",
                                        }}
                                    >
                                        <span style={{ textAlign: "right" }}>
                                            {orderDetails.subTotal}
                                        </span>
                                        <span style={{ textAlign: "right" }}>
                                            {orderDetails.shipping}
                                        </span>
                                        <span style={{ textAlign: "right" }}>
                                            {orderDetails.tax}
                                        </span>
                                        <span style={{ textAlign: "right" }}>
                                            ${orderDetails.totalAmount}
                                        </span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
};
export default OrderStatus;
