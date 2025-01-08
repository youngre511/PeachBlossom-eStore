import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
} from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";
import StatusStepper from "./StatusStepper";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";
import OrderDetailsProductRow from "./OrderDetailsProductRow";
import { IOrderDetails } from "../OrderStatus";

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

const stepsCancelled = [
    {
        label: "In Process",
        description:
            "We've received your order, and we're working hard to get it to you as soon as possible. Our team members are gathering the products you ordered to prepare them for shipping.",
    },
    {
        label: "Cancelled",
        description:
            "Your order has been cancelled. Any payments that have been processed have been refunded to the card they were purchased with.",
    },
];

interface Props {
    orderDetails: IOrderDetails;
}
const OrderDetails: React.FC<Props> = ({ orderDetails }) => {
    const [activeStep, setActiveStep] = useState<number>(0);
    const [stepDefinitions, setStepDefinitions] =
        useState<Array<{ label: string; description: string }>>(steps);
    const [splitShippingAddress, setSplitShippingAddress] = useState<string[]>([
        "",
        "",
    ]);
    const [formattedDate, setFormattedDate] = useState<string>("");
    const { width } = useWindowSizeContext();

    useEffect(() => {
        if (orderDetails) {
            switch (orderDetails.orderStatus) {
                case "in process":
                    setActiveStep(0);
                    break;
                case "ready to ship":
                    setActiveStep(1);
                    break;
                case "shipped":
                    setActiveStep(2);
                    break;
                case "delivered":
                    setActiveStep(3);
                    break;
                case "cancelled": {
                    setActiveStep(1);
                    setStepDefinitions(stepsCancelled);
                    break;
                }
                default:
                    setActiveStep(0);
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

    return (
        <React.Fragment>
            <div className="order-details-container">
                <div className="order-status-header">
                    <h1>Order #{orderDetails.orderNo.toLowerCase()}</h1>
                    <span>Order Date: {formattedDate}</span>
                </div>
                <StatusStepper
                    steps={stepDefinitions}
                    activeStep={activeStep}
                />
                {width && width >= 600 && (
                    <div className="order-details">
                        <p className="status-summary">
                            {stepDefinitions[activeStep].description}
                        </p>
                    </div>
                )}
                <Table
                    sx={{ minWidth: 330 }}
                    aria-label="simple table"
                    className="order-item-list"
                >
                    <TableHead>
                        <TableRow>
                            <TableCell></TableCell>
                            {width && width > 1000 && (
                                <TableCell>Product No.</TableCell>
                            )}
                            <TableCell>Item</TableCell>
                            <TableCell>Quantity</TableCell>

                            <TableCell>
                                {width && width > 1000 ? "Price" : ""}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {orderDetails.OrderItem.map((item, index) => (
                            <OrderDetailsProductRow
                                item={item}
                                key={item.productNo}
                            />
                        ))}
                        <TableRow
                            sx={{
                                "& td, & th": { border: 0 },
                            }}
                        >
                            <TableCell colSpan={2}>
                                {" "}
                                <div className="shipping-billing-details">
                                    <div className="os-shipping-label">
                                        Shipping Address
                                    </div>
                                    <div>
                                        {splitShippingAddress[0]}
                                        {splitShippingAddress[1] !== "" && (
                                            <span>
                                                {splitShippingAddress[1]}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        {orderDetails.city},{" "}
                                        {orderDetails.stateAbbr}
                                    </div>
                                    <div>{orderDetails.zipCode}</div>
                                </div>
                            </TableCell>
                            {width && width > 1000 && <TableCell></TableCell>}
                            <TableCell>
                                <div
                                    style={{
                                        display: "flex",
                                        flexDirection: "column",
                                    }}
                                >
                                    <span>Subtotal</span>
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
        </React.Fragment>
    );
};
export default OrderDetails;
