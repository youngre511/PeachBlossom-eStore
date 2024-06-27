import React from "react";
import { RootState } from "../../store/customerStore";
import { useAppSelector, useAppDispatch } from "../../hooks/reduxHooks";
import { CartItem } from "../../features/Cart/CartTypes";
import {
    addItemToCart,
    updateItemQuantity,
} from "../../features/Cart/cartSlice";
import PeachButton from "../../../common/components/PeachButton";
import "./AddToCartButton.css";

interface Props {
    available: number;
    productNo: string;
}
const AddToCartButton: React.FC<Props> = ({ available, productNo }: Props) => {
    const inStock: boolean = available > 0;
    const cart = useAppSelector((state: RootState) => state.cart);
    const dispatch = useAppDispatch();
    const itemInCart: CartItem[] = cart.items.filter(
        (item) => item.productNo === productNo
    );
    console.log(itemInCart);
    const isInCart: boolean = itemInCart.length > 0;
    let numberInCart: number | null = null;
    if (isInCart) {
        numberInCart = itemInCart[0].quantity;
    }

    console.log(productNo);
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
            <button className="add-to-cart-btn disabled">OUT OF STOCK</button>
        );
    } else if (!isInCart) {
        buttonDisplay = (
            <PeachButton
                className="add-to-cart-btn"
                onClick={handleAddToCart}
                text="ADD TO CART"
                width="120px"
                height="30px"
            />
        );
    } else {
        buttonDisplay = (
            <div className="add-subtract">
                <PeachButton
                    className="decrease-quantity"
                    onClick={handleDecrease}
                    text="-"
                    height="25px"
                    width="25px"
                />
                <div className="quantity-display">
                    <p id={`quantity-${productNo}`}>{numberInCart}</p>
                </div>
                {numberInCart && numberInCart < available && (
                    <PeachButton
                        className="increase-quantity"
                        onClick={handleIncrease}
                        text="+"
                        height="25px"
                        width="25px"
                    />
                )}
            </div>
        );
    }
    return <div className="add-to-cart-container">{buttonDisplay}</div>;
};
export default AddToCartButton;
