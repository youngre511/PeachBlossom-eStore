import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
    AddActionData,
    RemoveActionData,
    CartItem,
    CartState,
    ChangeQuantityRequest,
} from "./CartTypes";
import { RootState } from "../../store/customerStore";
import axios from "axios";

const initialState: CartState = {
    items: [],
    subTotal: 0,
    numberOfItems: 0,
    // taxRate: null,
    // tax: null,
    // shipping: null,
    // overallDiscount: 0,
    // promoCode: null,
    // promoName: null,
    cartId: null,
    error: null,
};

interface updateQuantityArgs {
    productNo: string;
    newQuantity: number;
}
interface CartResponsePayload {
    success: boolean;
    message: string;
    cart: {
        items: CartItem[];
        subTotal: number;
        cartId: number;
        numberOfItems: number;
    };
}

interface CartResponse {
    message: string;
    payload: CartResponsePayload;
}

//Thunks//

export const addItemToCart = createAsyncThunk<
    CartResponsePayload,
    string,
    { state: RootState; rejectValue: string }
>(
    "cart/addItemToCart",
    async (productNo: string, { getState, dispatch, rejectWithValue }) => {
        const state = getState() as RootState;
        const currentCartItems = [...state.cart.items];
        const currentNumberOfItems = state.cart.numberOfItems;
        let productThumbnail: string | null = null;
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

            productThumbnail = productToAdd.images[0];

            const productObj: CartItem = {
                productNo: productToAdd.productNo,
                name: productToAdd.name,
                price: productToAdd.price,
                discountPrice: productToAdd.discountPrice,
                quantity: 1,
                thumbnailUrl: productThumbnail,
                productUrl: `/shop/product/${productToAdd.productNo}`,
            };
            dispatch(addItemOptimistic(productObj));
        }

        try {
            const actionData: AddActionData = {
                productNo: productNo,
                cartId: state.cart.cartId,
                quantity: 1,
                thumbnailUrl: productThumbnail,
            };
            const response = await axios.put<CartResponse>(
                `${process.env.REACT_APP_API_URL}cart/add-to-cart`,
                actionData
            );
            return response.data.payload;
        } catch (error: any) {
            dispatch(
                rollbackCartItems({
                    rollbackItems: currentCartItems,
                    rollbackNumber: currentNumberOfItems,
                })
            );
            return rejectWithValue(
                error.response?.data || ("Error adding item to cart" as string)
            );
        }
    }
);

//Remove Item from Cart
export const removeItemFromCart = createAsyncThunk<
    CartResponsePayload,
    string,
    { state: RootState; rejectValue: string }
>(
    "cart/removeItemFromCart",
    async (productNo: string, { getState, dispatch, rejectWithValue }) => {
        const state = getState() as RootState;
        const cartId = state.cart.cartId;
        if (!cartId) {
            return rejectWithValue("Cart not found");
        }
        const currentCartItems = [...state.cart.items];
        const currentNumberOfItems = state.cart.numberOfItems;
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
            const actionData: RemoveActionData = {
                productNo: productNo,
                cartId: cartId,
                quantity: 1,
            };
            const response = await axios.put<CartResponse>(
                `${process.env.REACT_APP_API_URL}cart/removeFrom`,
                actionData
            );
            return response.data.payload;
        } catch (error: any) {
            dispatch(
                rollbackCartItems({
                    rollbackItems: currentCartItems,
                    rollbackNumber: currentNumberOfItems,
                })
            );
            return rejectWithValue(
                error.response?.data ||
                    ("Error removing item from cart" as string)
            );
        }
    }
);

export const updateQuantity = createAsyncThunk<
    number,
    updateQuantityArgs,
    { state: RootState; rejectValue: string }
>(
    "cart/updateQuantity",
    async (updateQuantityArgs, { getState, dispatch, rejectWithValue }) => {}
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
            state.numberOfItems++;
        },
        removeItemOptimistic: (state, action: PayloadAction<string>) => {
            const index = state.items.findIndex(
                (item) => item.productNo === action.payload
            );
            if (index !== -1) {
                state.items.splice(index, 1);
                state.numberOfItems--;
            }
        },
        changeQuantityOptimistic: (
            state,
            action: PayloadAction<ChangeQuantityRequest>
        ) => {
            state.items[action.payload.productIndex].quantity =
                state.items[action.payload.productIndex].quantity +
                action.payload.adjustmentAmount;
            state.numberOfItems += action.payload.adjustmentAmount;
        },
        rollbackCartItems: (
            state,
            action: PayloadAction<{
                rollbackItems: CartItem[];
                rollbackNumber: number;
            }>
        ) => {
            state.items = action.payload.rollbackItems;
            state.numberOfItems = action.payload.rollbackNumber;
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
                state.items = action.payload.cart.items;
                state.subTotal = action.payload.cart.subTotal;
                // state.taxRate = action.payload.taxRate;
                // state.tax = action.payload.tax;
                // state.shipping = action.payload.shipping;
                state.cartId = action.payload.cart.cartId;
                state.numberOfItems = action.payload.cart.numberOfItems;
                state.error = null;
            })
            .addCase(addItemToCart.rejected, (state, action) => {
                state.error = action.payload || "Failed to fetch products";
            })
            .addCase(removeItemFromCart.pending, (state) => {
                state.error = null;
            })
            .addCase(removeItemFromCart.fulfilled, (state, action) => {
                state.items = action.payload.cart.items;
                state.subTotal = action.payload.cart.subTotal;
                state.cartId = action.payload.cart.cartId;
                state.numberOfItems = action.payload.cart.numberOfItems;
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
