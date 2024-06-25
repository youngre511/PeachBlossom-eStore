import React from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

interface Props {}
const OrderConfirmation: React.FC<Props> = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const orderNo = queryParams.get("orderNo");
    return <div>Order {orderNo} confirmed</div>;
};
export default OrderConfirmation;
