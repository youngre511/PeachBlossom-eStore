import React, { useState } from "react";
import { CartItem as item } from "../Cart/CartTypes";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { RootState } from "../../store/customerStore";
import { updateItemQuantity } from "../Cart/cartSlice";

interface Props {
    item: item;
}
const CartItem: React.FC<Props> = ({ item }: Props) => {
    const [quantity, setQuantity] = useState<string>(String(item.quantity));
    const totalPrice =
        item.quantity * (item.discountPrice ? item.discountPrice : item.price);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleUpdateQuantity = () => {
        dispatch(
            updateItemQuantity({
                productNo: item.productNo,
                newQuantity: +quantity,
            })
        );
    };

    const location = useLocation();

    const cartView: boolean = location.pathname === "/shoppingcart";

    const updateLocalQuantity = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newQuantity: string = event.target.value;
        setQuantity(newQuantity);
    };

    const handleRemoveProduct = () => {
        dispatch(
            updateItemQuantity({
                productNo: item.productNo,
                newQuantity: 0,
            })
        );
    };

    return (
        <div className="cart-item">
            <div className="thumbnail-remove">
                <img
                    src={item.thumbnailUrl}
                    alt={item.name}
                    className="cart-thumbnail"
                    onClick={() => navigate(item.productUrl)}
                />
                {cartView && (
                    <div
                        className="remove-button"
                        role="button"
                        onClick={handleRemoveProduct}
                    >
                        Remove
                    </div>
                )}
            </div>
            <div className="cartItemDetails">
                <div className="cart-name-and-number">
                    <Link to={item.productUrl}>
                        <h2 className="cart-item-name">{item.name}</h2>
                    </Link>
                    <div className="cart-productNo">#{item.productNo}</div>
                </div>
                <div className="price-and-quantity">
                    {!cartView && (
                        <div className="drop-quantity">
                            Qty: {item.quantity}
                        </div>
                    )}
                    {item.discountPrice && (
                        <div className="pricing">
                            <div className="discount-price">
                                {item.discountPrice}
                            </div>
                            <div className="reg-price">{item.price}</div>
                        </div>
                    )}
                    {!item.discountPrice && (
                        <div className="pricing">
                            <div className="price">{item.price}</div>
                        </div>
                    )}
                    {cartView && (
                        <div className="quantity">
                            <div>
                                Qty.
                                <input
                                    type="number"
                                    value={quantity}
                                    onChange={updateLocalQuantity}
                                    max={item.maxAvailable}
                                />
                            </div>
                            <div
                                role="button"
                                className="update-quantity"
                                onClick={handleUpdateQuantity}
                            >
                                Update
                            </div>
                        </div>
                    )}
                </div>
                {cartView && (
                    <div className="item-total">
                        <p className="total-label">Item Total</p>
                        <p className="item-total-price">${totalPrice}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
export default CartItem;
