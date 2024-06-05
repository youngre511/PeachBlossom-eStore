import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { CartItem, CartState } from "./CartTypes";

const initialState: CartState = {
    items: [],
    subTotal: 0,
    taxRate: null,
    tax: null,
    shipping: null,
    overallDiscount: 0,
    promoCode: null,
    promoName: null,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItemOptimistic: (state, action: PayloadAction<CartItem>) => {},
        removeItemOptimistic: (state, action: PayloadAction<string>) => {},
        clearCart: (state) => {
            state.items = [];
            state.subTotal = 0;
            state.taxRate = null;
            state.tax = null;
            state.shipping = null;
            state.overallDiscount = 0;
            state.promoCode = null;
            state.promoName = null;
        },
        addCartPromo: (state, action: PayloadAction<string>) => {},
        removeCartPromo: (state, action: PayloadAction<string>) => {},
        syncCart: (state, action: PayloadAction<CartState>) => {},
    },
});

export default cartSlice;
