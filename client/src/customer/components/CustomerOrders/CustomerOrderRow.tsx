import React from "react";
import { useEffect } from "react";
import { CustomerOrder } from "../../features/UserData/UserDataTypes";
import PeachButton from "../../../common/components/PeachButton";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { setCurrentOrderNo } from "../../features/UserData/userDataSlice";
import { useNavigate } from "react-router-dom";

interface CustomerOrderRowProps {
    order: CustomerOrder;
}
const CustomerOrderRow: React.FC<CustomerOrderRowProps> = ({ order }) => {
    const dateObj = new Date(order.orderDate);
    const dateOptions: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
    };
    const timeOptions: Intl.DateTimeFormatOptions = {
        hour: "numeric",
        minute: "2-digit",
    };
    const date = dateObj.toLocaleDateString("en-us", dateOptions);
    const time = dateObj.toLocaleTimeString("en-us", timeOptions);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleClick = () => {
        dispatch(setCurrentOrderNo(order.orderNo));
        navigate("/order-status");
    };

    return (
        <div className="order-row">
            <div className="order-top-bar">
                <div className="top-bar-left">
                    <div className="placed-on">
                        <div className="placed-on-label">Placed on</div>
                        <div className="placed-on-date">
                            <span className="date">{date}</span>
                            <span className="time">{time}</span>
                        </div>
                    </div>
                    <div className="order-row-total">
                        <div className="order-row-total-label">Total</div>
                        <div className="order-row-total-amount">
                            ${order.totalAmount}
                        </div>
                    </div>
                </div>
                <div className="customer-order-no">
                    <div className="customer-order-no-label">Order number</div>
                    <div className="customer-order-no-number">
                        #{order.orderNo}
                    </div>
                </div>
            </div>
            <div className="order-content">
                <div className="order-description">
                    <img
                        className="order-thumbnail"
                        src={`${order.thumbnailUrl}_300.webp`}
                    />
                    <div className="item-number">
                        {order.numberOfItems} items
                    </div>
                </div>
                <div className="order-options">
                    <PeachButton
                        text="view details"
                        onClick={handleClick}
                        width="150px"
                    />
                </div>
            </div>
        </div>
    );
};
export default CustomerOrderRow;
