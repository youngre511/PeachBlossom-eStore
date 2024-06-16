import React from "react";
import { useState } from "react";
import { CartItem as item } from "../Cart/CartTypes";
import { Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../hooks/reduxHooks";
import { RootState } from "../../store/customerStore";

interface Props {
    item: item;
    key: string;
}
const CartItem: React.FC<Props> = ({ item, key }: Props) => {
    const [quantity, setQuantity] = useState<string>(String(item.quantity));
    const totalPrice =
        item.quantity * (item.discountPrice ? item.discountPrice : item.price);
    const dispatch = useAppDispatch();
    // Future: update to set max value at current stock

    const handleUpdateQuantity = () => {
        dispatch("cart/updateQuantity", +quantity);
    };

    const updateLocalQuantity = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newQuantity: string = event.target.value;
        setQuantity(newQuantity);
    };

    return (
        <div className="cart-item" key={key}>
            <div className="thumbnail-remove">
                <Link to={item.productUrl}>
                    <img src={item.thumbnailUrl} alt={item.name} />
                </Link>
                <p
                    className="remove-button"
                    role="button"
                    id={`remove-${item.productNo}`}
                    data-productNo={item.productNo}
                >
                    Remove
                </p>
            </div>
            <div className="cartItemDetails">
                <Link to={item.productUrl}>
                    <h2>{item.name}</h2>
                </Link>
                <p className="cart-productNo">#{item.productNo}</p>
                <div className="price-and-quantity">
                    {item.discountPrice && (
                        <div className="pricing">
                            <p className="discount-price">
                                {item.discountPrice}
                            </p>
                            <p className="reg-price">{item.price}</p>
                        </div>
                    )}
                    {!item.discountPrice && (
                        <div className="pricing">
                            <p className="price">{item.price}</p>
                        </div>
                    )}
                    <div className="quantity">
                        <input
                            type="number"
                            value={quantity}
                            onChange={updateLocalQuantity}
                        />
                        <p
                            role="button"
                            className="update-quantity"
                            onClick={handleUpdateQuantity}
                        >
                            Update
                        </p>
                    </div>
                    <div className="item-total">
                        <p className="total-label">Item Total</p>
                        <p className="item-total-price">${totalPrice}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CartItem;
