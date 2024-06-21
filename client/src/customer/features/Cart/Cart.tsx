import React from "react";
import { useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/customerStore";
import CartItem from "../CartItem/CartItem";
import { useNavigate } from "react-router-dom";

const Cart: React.FC = () => {
    const cart = useAppSelector((state: RootState) => state.cart);
    const navigate = useNavigate();

    console.log(cart);

    return (
        <div className="cart-container">
            <div className="cart">
                <h1>ShoppingCart</h1>
                <div className="cart-items-container">
                    {cart.items.length === 0 && <p>No items in cart</p>}
                    {cart.items.length > 0 &&
                        cart.items.map((item) => (
                            <CartItem item={item} key={item.productNo} />
                        ))}
                </div>
            </div>
            <div className="order-options">
                <h2>Order Summary</h2>
                <div className="cart-subtotal">
                    <p>Subtotal ({cart.numberOfItems} items)</p>
                    <p>${cart.subTotal}</p>
                </div>
                <button onClick={() => navigate("/checkout")}>CHECKOUT</button>
            </div>
        </div>
    );
};
export default Cart;
