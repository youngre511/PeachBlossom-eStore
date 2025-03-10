import React from "react";
import { RootState } from "../../store/customerStore";
import { useAppSelector, useAppDispatch } from "../../hooks/reduxHooks";
import { CartItem } from "../../features/Cart/CartTypes";
import {
    addItemToCart,
    updateItemQuantity,
} from "../../features/Cart/cartSlice";
import GoldButton from "../../../common/components/GoldButton";
import "./AddToCartButton.css";

interface Props {
    available: number;
    productNo: string;
    isTouchDevice?: boolean;
}
const AddToCartButton: React.FC<Props> = ({
    available,
    productNo,
    isTouchDevice = false,
}: Props) => {
    const inStock: boolean = available > 0;
    const cart = useAppSelector((state: RootState) => state.cart);
    const dispatch = useAppDispatch();
    const itemInCart: CartItem[] = cart.items.filter(
        (item) => item.productNo === productNo
    );

    const isInCart: boolean = itemInCart.length > 0;
    let numberInCart: number | null = null;
    if (isInCart) {
        numberInCart = itemInCart[0].quantity;
    }

    const handleAddToCart = () => {
        dispatch(addItemToCart(productNo));
    };

    const handleIncrease = () => {
        const currentQuantity = numberInCart as number;
        const newQuantity = currentQuantity + 1;
        dispatch(
            updateItemQuantity({
                productNo: productNo,
                newQuantity: newQuantity,
            })
        );
    };

    const handleDecrease = () => {
        const currentQuantity = numberInCart as number;
        const newQuantity = currentQuantity - 1;
        dispatch(
            updateItemQuantity({
                productNo: productNo,
                newQuantity: newQuantity,
            })
        );
    };

    let buttonDisplay;

    if (!inStock) {
        buttonDisplay = (
            <GoldButton
                className="add-to-cart-btn disabled"
                text="OUT OF STOCK"
                disabled={true}
                onClick={() => {
                    return;
                }}
                width={"120px"}
                height={"30px"}
                mobile={isTouchDevice}
            />
        );
    } else if (!isInCart) {
        buttonDisplay = (
            <GoldButton
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                text="ADD TO CART"
                width="120px"
                height="30px"
                mobile={isTouchDevice}
            />
        );
    } else {
        buttonDisplay = (
            <div className="add-subtract">
                <GoldButton
                    className="decrease-quantity"
                    onClick={handleDecrease}
                    text="-"
                    height="25px"
                    width="25px"
                    mobile={isTouchDevice}
                />
                <div className="quantity-display">
                    <p
                        id={`quantity-${productNo}`}
                        style={{ cursor: "default" }}
                    >
                        {numberInCart}
                    </p>
                </div>
                {numberInCart && (
                    <GoldButton
                        className="increase-quantity"
                        onClick={handleIncrease}
                        text="+"
                        height="25px"
                        width="25px"
                        disabled={numberInCart >= available}
                        mobile={isTouchDevice}
                    />
                )}
            </div>
        );
    }
    return <div className="add-to-cart-container">{buttonDisplay}</div>;
};
export default AddToCartButton;
