import React, { useEffect, useState } from "react";
import { CartItem as item } from "../Cart/CartTypes";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { updateItemQuantity } from "../Cart/cartSlice";
import "./cart-item.css";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

interface Props {
    item: item;
}
const CartItem: React.FC<Props> = ({ item }: Props) => {
    const [quantity, setQuantity] = useState<string>(String(item.quantity));
    const totalPrice = (
        item.quantity * (item.discountPrice ? item.discountPrice : item.price)
    ).toFixed(2);
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isTouchDevice } = useWindowSizeContext();

    const handleUpdateQuantity = () => {
        let updateQuantity = +quantity;

        if (updateQuantity > item.maxAvailable) {
            updateQuantity = item.maxAvailable;
            setQuantity(String(item.maxAvailable));
        }

        dispatch(
            updateItemQuantity({
                productNo: item.productNo,
                newQuantity: updateQuantity,
            })
        );
    };

    useEffect(() => {
        console.log("quantity:", quantity);
    }, [quantity]);

    const location = useLocation();

    const cartView: boolean = location.pathname === "/shoppingcart";

    const updateLocalQuantity = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const newQuantity: string = event.target.value;
        const sanitizedQuantity = newQuantity.replace(/\D/g, "");
        setQuantity(sanitizedQuantity);
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
                    src={`${item.thumbnailUrl}_300.webp`}
                    srcSet={
                        cartView
                            ? `${item.thumbnailUrl}_140.webp, ${item.thumbnailUrl}_140.webp 2x, ${item.thumbnailUrl}_300.webp 3x`
                            : `${item.thumbnailUrl}_140.webp, ${item.thumbnailUrl}_140.webp 2x, ${item.thumbnailUrl}_140.webp 3x`
                    }
                    alt={item.name}
                    className="cart-thumbnail"
                    onClick={() => navigate(`/product?pn=${item.productNo}`)}
                    height={cartView ? "70px" : "40px"}
                    width={cartView ? "70px" : "40px"}
                    loading="lazy"
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
                    <Link to={`/product?pn=${item.productNo}`}>
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
                                    type="text"
                                    inputMode="numeric"
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
                        <div className="total-label">Item Total</div>
                        <div className="item-total-price">${totalPrice}</div>
                    </div>
                )}
            </div>
        </div>
    );
};
export default CartItem;
