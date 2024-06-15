import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
    ActionData,
    CartItem,
    CartState,
    ChangeQuantityRequest,
} from "./CartTypes";
import { RootState } from "../../store/customerStore";
import axios from "axios";

const initialState: CartState = {
    items: [],
    subTotal: 0,
    // taxRate: null,
    // tax: null,
    // shipping: null,
    // overallDiscount: 0,
    // promoCode: null,
    // promoName: null,
    cartId: null,
    error: null,
};

//Thunks//

export const addItemToCart = createAsyncThunk<
    CartState,
    string,
    { state: RootState; rejectValue: string }
>(
    "cart/addItemToCart",
    async (productNo: string, { getState, dispatch, rejectWithValue }) => {
        const state = getState() as RootState;
        const currentCartItems = [...state.cart.items];
        const indexInCart = state.cart.items.findIndex(
            (item: any) => item.productNo === productNo
        );

        if (indexInCart !== -1) {
            dispatch(
                changeQuantityOptimistic({
                    productIndex: indexInCart,
                    adjustmentAmount: 1,
                })
            );
        } else {
            const productToAdd = state.catalog.products.find(
                (p: any) => p.productNo === productNo
            );
            if (!productToAdd) {
                return rejectWithValue("Product not found");
            }

            const productObj: CartItem = {
                productNo: productToAdd.productNo,
                name: productToAdd.name,
                price: productToAdd.price,
                discountPrice: productToAdd.discountPrice,
                quantity: 1,
                thumbnailUrl: productToAdd.images[0],
                productUrl: `/shop/product/${productToAdd.productNo}`,
            };
            dispatch(addItemOptimistic(productObj));
        }

        try {
            const actionData: ActionData = {
                productNo: productNo,
                cartId: state.cart.cartId,
            };
            const response = await axios.put<CartState>(
                "https://api.peachblossom.ryanyoung.codes/cart/addto",
                actionData
            );
            return response.data;
        } catch (error: any) {
            dispatch(rollbackCartItems(currentCartItems));
            return rejectWithValue(
                error.response?.data || ("Error adding item to cart" as string)
            );
        }
    }
);

//Remove Item from Cart
export const removeItemFromCart = createAsyncThunk<
    CartState,
    string,
    { state: RootState; rejectValue: string }
>(
    "cart/removeItemFromCart",
    async (productNo: string, { getState, dispatch, rejectWithValue }) => {
        const state = getState() as RootState;
        const currentCartItems = [...state.cart.items];
        const indexInCart = state.cart.items.findIndex(
            (item: any) => item.productNo === productNo
        );
        if (indexInCart === -1) {
            return rejectWithValue("Product not found");
        }

        if (state.cart.items[indexInCart].quantity > 1) {
            dispatch(
                changeQuantityOptimistic({
                    productIndex: indexInCart,
                    adjustmentAmount: 1,
                })
            );
        } else {
            dispatch(removeItemOptimistic(productNo));
        }

        try {
            const actionData: ActionData = {
                productNo: productNo,
                cartId: state.cart.cartId,
            };
            const response = await axios.put<CartState>(
                "https://api.peachblossom.ryanyoung.codes/cart/removeFrom",
                actionData
            );
            return response.data;
        } catch (error: any) {
            dispatch(rollbackCartItems(currentCartItems));
            return rejectWithValue(
                error.response?.data ||
                    ("Error removing item from cart" as string)
            );
        }
    }
);

//Add Promo To Cart

//Remove Promo From Cart

//Slice//

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        addItemOptimistic: (state, action: PayloadAction<CartItem>) => {
            state.items.push(action.payload);
        },
        removeItemOptimistic: (state, action: PayloadAction<string>) => {
            const index = state.items.findIndex(
                (item) => item.productNo === action.payload
            );
            if (index !== -1) {
                state.items.splice(index, 1);
            }
        },
        changeQuantityOptimistic: (
            state,
            action: PayloadAction<ChangeQuantityRequest>
        ) => {
            state.items[action.payload.productIndex].quantity =
                state.items[action.payload.productIndex].quantity +
                action.payload.adjustmentAmount;
        },
        rollbackCartItems: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
        },
        clearCart: (state) => {
            state.items = [];
            state.subTotal = 0;
            // state.taxRate = null;
            // state.tax = null;
            // state.shipping = null;
            // state.overallDiscount = 0;
            // state.promoCode = null;
            // state.promoName = null;
        },
        addCartPromo: (state, action: PayloadAction<string>) => {},
        removeCartPromo: (state, action: PayloadAction<string>) => {},
    },
    extraReducers: (builder) => {
        builder
            .addCase(addItemToCart.pending, (state) => {
                state.error = null;
            })
            .addCase(addItemToCart.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.subTotal = action.payload.subTotal;
                // state.taxRate = action.payload.taxRate;
                // state.tax = action.payload.tax;
                // state.shipping = action.payload.shipping;
                // state.cartId = action.payload.cartId;
                state.error = null;
            })
            .addCase(addItemToCart.rejected, (state, action) => {
                state.error = action.payload || "Failed to fetch products";
            })
            .addCase(removeItemFromCart.pending, (state) => {
                state.error = null;
            })
            .addCase(removeItemFromCart.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.subTotal = action.payload.subTotal;
                state.cartId = action.payload.cartId;
                state.error = null;
            })
            .addCase(removeItemFromCart.rejected, (state, action) => {
                state.error = action.payload || "Failed to fetch products";
            });
    },
});

export const {
    addItemOptimistic,
    removeItemOptimistic,
    changeQuantityOptimistic,
    rollbackCartItems,
    clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
