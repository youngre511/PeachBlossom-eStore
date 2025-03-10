import {
    useState,
    useEffect,
    useCallback,
    useContext,
    SetStateAction,
} from "react";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { holdCartStock, syncCart } from "../../Cart/cartSlice";
import { logAxiosError } from "../../../../common/utils/logAxiosError";
import { getCustomerAddresses } from "../../../store/userData/userDataSlice";
import { AuthContext } from "../../../../common/contexts/authContext";
import { CartItem, CartState } from "../../Cart/CartTypes";

interface CheckoutInitializationProps {
    cart: CartState;
    setCurrentCartItems: React.Dispatch<SetStateAction<CartItem[]>>;
}

function useCheckoutInitialization({
    cart,
    setCurrentCartItems,
}: CheckoutInitializationProps): void {
    const dispatch = useAppDispatch();
    const auth = useContext(AuthContext);
    // Hold stock till checkout is complete or user navigates away from page.
    useEffect(() => {
        // Function to hold stock when the component mounts
        const holdStock = async () => {
            if (cart.cartId) {
                dispatch(syncCart());
                setCurrentCartItems([...cart.items]);
            }
            try {
                dispatch(holdCartStock());
            } catch (error) {
                logAxiosError(error, "placing hold on stock");
            }
        };

        // Hold stock when component mounts
        holdStock();

        // Fetch customer addresses if logged in
        if (auth && auth.user && !auth.isTokenExpired()) {
            dispatch(getCustomerAddresses({ force: true }));
        }
    }, []);

    return;
}

export default useCheckoutInitialization;
