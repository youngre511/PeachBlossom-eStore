import React from "react";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/customerStore";
import CartItem from "../CartItem/CartItem";

interface Props {
    setCartDropdownVisible: React.Dispatch<React.SetStateAction<boolean>>;
}
const CartDropDown: React.FC<Props> = ({ setCartDropdownVisible }) => {
    const cart = useAppSelector((state: RootState) => state.cart);
    const navigate = useNavigate();
    return (
        <div
            className="drop-cart"
            onMouseEnter={() => setCartDropdownVisible(true)}
            onMouseLeave={() => setCartDropdownVisible(false)}
        >
            <div className="drop-cart-bkg"></div>
            <div className="drop-cart-bkg-overlay"></div>
            <div className="drop-cart-container">
                <div className="drop-cart-items">
                    {cart.numberOfItems === 1 && (
                        <h1>{cart.numberOfItems} item in your cart</h1>
                    )}
                    {cart.numberOfItems > 1 && (
                        <h1>{cart.numberOfItems} items in your cart</h1>
                    )}
                    <div className="drop-cart-items-container">
                        {cart.items.length === 0 && <p>No items in cart</p>}
                        {cart.items.length > 0 &&
                            cart.items
                                .slice(0, 4)
                                .map((item) => (
                                    <CartItem
                                        item={item}
                                        key={item.productNo}
                                    />
                                ))}
                    </div>
                </div>
                <div className="drop-subtotal">
                    <p className="drop-sub-label">Subtotal:</p>
                    <p className="drop-sub-amount">${cart.subTotal}</p>
                </div>
                <div className="drop-cart-nav-options">
                    <button onClick={() => navigate("/shoppingcart")}>
                        VIEW CART
                    </button>
                    <button>CHECKOUT</button>
                </div>
            </div>
        </div>
    );
};
export default CartDropDown;
