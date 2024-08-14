import React from "react";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/customerStore";
import CartItem from "../CartItem/CartItem";
import "./cart-drop-down.css";
import PeachButton from "../../../common/components/PeachButton";

interface Props {
    isCartDropdownVisible: boolean;
    handleCartMouseEnter: () => void;
    handleCartMouseLeave: () => void;
}
const CartDropDown: React.FC<Props> = ({
    isCartDropdownVisible,
    handleCartMouseEnter,
    handleCartMouseLeave,
}) => {
    const cart = useAppSelector((state: RootState) => state.cart);
    const navigate = useNavigate();
    return (
        <div
            className="drop-cart"
            onMouseEnter={() => handleCartMouseEnter()}
            onMouseLeave={() => handleCartMouseLeave()}
            style={{ pointerEvents: isCartDropdownVisible ? "auto" : "none" }}
        >
            <div className="drop-cart-bkg"></div>
            <div className="drop-cart-bkg-overlay"></div>
            <div className="drop-cart-container">
                <div className="drop-cart-items">
                    {cart.numberOfItems === 1 && (
                        <h2>{cart.numberOfItems} item in your cart</h2>
                    )}
                    {cart.numberOfItems > 1 && (
                        <h2>{cart.numberOfItems} items in your cart</h2>
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
                        {cart.items.length > 3 && (
                            <span className="cart-see-more">
                                View cart to see all items
                            </span>
                        )}
                    </div>
                </div>
                <div className="drop-cart-footer">
                    <div className="drop-subtotal">
                        <p className="drop-sub-label">Subtotal:</p>
                        <p className="drop-sub-amount">${cart.subTotal}</p>
                    </div>
                    <div className="drop-cart-nav-options">
                        <PeachButton
                            text="VIEW CART"
                            width="110px"
                            onClick={() => navigate("/shoppingcart")}
                        />

                        <PeachButton
                            text="CHECKOUT"
                            width="110px"
                            onClick={() => navigate("/checkout")}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CartDropDown;
