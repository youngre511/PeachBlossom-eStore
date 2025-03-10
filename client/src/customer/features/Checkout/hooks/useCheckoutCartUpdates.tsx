import { useEffect, SetStateAction } from "react";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { setCartChangesMade } from "../../Cart/cartSlice";
import { CartItem, CartState } from "../../Cart/CartTypes";

interface CheckoutCartUpdatesProps {
    cart: CartState;
    setCartEdited: React.Dispatch<SetStateAction<boolean>>;
    setCurrentCartItems: React.Dispatch<SetStateAction<CartItem[]>>;
}

function useCheckoutCartUpdates({
    cart,
    setCartEdited,
    setCurrentCartItems,
}: CheckoutCartUpdatesProps): void {
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (cart.cartChangesMade) {
            setCartEdited(true);
            dispatch(setCartChangesMade(false));
        }
    }, [cart.cartChangesMade]);

    useEffect(() => {
        setCurrentCartItems([...cart.items]);
    }, [cart.items]);

    return;
}

export default useCheckoutCartUpdates;
