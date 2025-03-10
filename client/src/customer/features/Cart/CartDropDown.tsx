import React from "react";
import { useAppSelector } from "../../hooks/reduxHooks";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../store/customerStore";
import CartItem from "./components/CartItem";
import "./cart-drop-down.css";
import GoldButton from "../../../common/components/GoldButton";
import DropdownMenu from "../../components/DropdownMenu/DropdownMenu";

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
        <DropdownMenu
            className="drop-cart"
            handleMouseEnter={handleCartMouseEnter}
            handleMouseLeave={handleCartMouseLeave}
            visibilityState={isCartDropdownVisible}
            arrowLeft={false}
            heightPx={460}
            rightPx={20}
            minHeightPx={580}
        >
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
                                <CartItem item={item} key={item.productNo} />
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
                    <GoldButton
                        text="VIEW CART"
                        width="110px"
                        onClick={() => navigate("/shoppingcart")}
                    />

                    <GoldButton
                        text="CHECKOUT"
                        width="110px"
                        disabled={cart.numberOfItems === 0}
                        onClick={() => navigate("/checkout")}
                    />
                </div>
            </div>
        </DropdownMenu>
    );
};
export default CartDropDown;
