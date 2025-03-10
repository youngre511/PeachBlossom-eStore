import React from "react";
import GoldButton from "../../../common/components/GoldButton";
import { ChevronRight } from "@mui/icons-material";
import { CustomerOrder } from "../../store/userData/UserDataTypes";
import { setCurrentOrderNo } from "../../store/userData/userDataSlice";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { useNavigate } from "react-router-dom";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

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
    const { width } = useWindowSizeContext();

    const handleClick = () => {
        dispatch(setCurrentOrderNo(order.orderNo));
        navigate("/order-status");
    };

    return (
        <div
            className="order-row"
            onClick={width && width < 600 ? handleClick : undefined}
        >
            {width && width >= 600 && (
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
                        <div className="customer-order-no-label">
                            Order number
                        </div>
                        <div className="customer-order-no-number">
                            #{order.orderNo}
                        </div>
                    </div>
                </div>
            )}
            <div className="order-content">
                <div className="order-description">
                    <img
                        className="order-thumbnail"
                        src={`${order.thumbnailUrl}_300.webp`}
                    />
                    <div className="customer-order-details">
                        {width && width < 600 && (
                            <div className="placed-on">
                                <div className="placed-on-label">
                                    {width && width < 600 ? "Order p" : "P"}
                                    laced on
                                </div>
                                <div className="placed-on-date">
                                    <span className="date">{date}</span>
                                    <span className="time">{time}</span>
                                </div>
                            </div>
                        )}
                        <div className="item-number">
                            {order.numberOfItems} items
                        </div>
                    </div>
                </div>
                <div className="order-options">
                    {width && width >= 600 ? (
                        <GoldButton
                            text="view details"
                            onClick={handleClick}
                            width="150px"
                        />
                    ) : (
                        <ChevronRight />
                    )}
                </div>
            </div>
        </div>
    );
};
export default CustomerOrderRow;
