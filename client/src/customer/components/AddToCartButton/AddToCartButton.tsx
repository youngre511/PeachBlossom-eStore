import React from "react";
import { RootState } from "../../store/customerStore";
import { useAppSelector } from "../../hooks/reduxHooks";
import { CartItem } from "../../features/Cart/CartTypes";

interface Props {
    available: number;
    productNo: string;
}
const AddToCartButton: React.FC<Props> = ({ available, productNo }: Props) => {
    const inStock: boolean = available > 0;
    const cart = useAppSelector((state: RootState) => state.cart);
    const itemInCart: CartItem[] = cart.items.filter(
        (item) => item.productNo === productNo
    );
    const isInCart: boolean = itemInCart.length > 0;
    let numberInCart: number | null = null;
    if (isInCart) {
        numberInCart = itemInCart[0].quantity;
    }

    let buttonDisplay;

    if (!inStock) {
        buttonDisplay = (
            <button className="add-to-cart-btn disabled">OUT OF STOCK</button>
        );
    } else if (!isInCart) {
        buttonDisplay = (
            <button className="add-to-cart-btn" id={productNo}>
                ADD TO CART
            </button>
        );
    } else {
        buttonDisplay = (
            <div className="add-subtract">
                <button
                    className="decrease-quantity"
                    id={`decrease-${productNo}`}
                >
                    -
                </button>
                <div className="quantity-display">
                    <p id={`quantity-${productNo}`}>{numberInCart}</p>
                </div>
                <button
                    className="increase-quantity"
                    id={`increase-${productNo}`}
                >
                    +
                </button>
            </div>
        );
    }
    return <div className="add-to-cart-container">{buttonDisplay}</div>;
};
export default AddToCartButton;
