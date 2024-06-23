import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
    AddActionData,
    UpdateActionData,
    DeleteActionData,
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
        console.log("running add item to cart");
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
            console.log("running changeQuantity");
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
                maxAvailable: productToAdd.stock,
            };
            console.log("adding optimistic");
            dispatch(addItemOptimistic(productObj));
        }

        try {
            const actionData: AddActionData = {
                productNo: productNo,
                cartId: state.cart.cartId,
                quantity: 1,
                thumbnailUrl: productThumbnail,
            };
            console.log("making api request");
            const response = await axios.put<CartResponse>(
                `${process.env.REACT_APP_API_URL}cart/add-to-cart`,
                actionData
            );
            console.log(response);
            if (!response.data.payload.cart) {
                throw new Error(response.data.message);
            }
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

export const updateItemQuantity = createAsyncThunk<
    CartResponsePayload,
    updateQuantityArgs,
    { state: RootState; rejectValue: string }
>(
    "cart/updateItemQuantity",
    async (updateQuantityArgs, { getState, dispatch, rejectWithValue }) => {
        const { productNo, newQuantity } = updateQuantityArgs;
        const state = getState() as RootState;
        const cartId = state.cart.cartId;
        if (!cartId) {
            return rejectWithValue("Cart not found");
        }
        const currentCartItems = [...state.cart.items];
        const currentNumberOfItems = state.cart.numberOfItems;
        const indexInCart = state.cart.items.findIndex(
            (item: CartItem) => item.productNo === productNo
        );
        if (indexInCart === -1) {
            return rejectWithValue("Product not found");
        }
        try {
            if (newQuantity > 0) {
                dispatch(
                    changeQuantityOptimistic({
                        productIndex: indexInCart,
                        adjustmentAmount:
                            newQuantity -
                            state.cart.items[indexInCart].quantity,
                    })
                );
                const actionData: UpdateActionData = {
                    productNo: productNo,
                    cartId: cartId,
                    quantity: newQuantity,
                };
                const response = await axios.put<CartResponse>(
                    `${process.env.REACT_APP_API_URL}cart/update-quantity`,
                    actionData
                );
                return response.data.payload;
            } else {
                dispatch(deleteItemOptimistic(productNo));

                const actionData: DeleteActionData = {
                    productNo: productNo,
                    cartId: cartId,
                };
                const response = await axios.put<CartResponse>(
                    `${process.env.REACT_APP_API_URL}cart/delete-from-cart`,
                    actionData
                );
                return response.data.payload;
            }
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

export const syncCart = createAsyncThunk<
    CartResponsePayload,
    number,
    { state: RootState; rejectValue: string }
>("cart/syncCart", async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState() as RootState;
        const response = await axios.get<CartResponse>(
            `${process.env.REACT_APP_API_URL}cart/cartId/${state.cart}`
        );
        return response.data.payload;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data || ("Error removing item from cart" as string)
        );
    }
});

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
        deleteItemOptimistic: (state, action: PayloadAction<string>) => {
            const index = state.items.findIndex(
                (item) => item.productNo === action.payload
            );
            if (index !== -1) {
                state.numberOfItems =
                    state.numberOfItems - state.items[index].quantity;
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
            state.cartId = null;
            state.error = null;
            state.numberOfItems = 0;
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

                state.cartId = action.payload.cart.cartId;
                state.numberOfItems = action.payload.cart.numberOfItems;
                state.error = null;
            })
            .addCase(addItemToCart.rejected, (state, action) => {
                state.error = action.payload || "Failed to fetch products";
            })
            .addCase(updateItemQuantity.pending, (state) => {
                state.error = null;
            })
            .addCase(updateItemQuantity.fulfilled, (state, action) => {
                state.items = action.payload.cart.items;
                state.subTotal = action.payload.cart.subTotal;
                state.cartId = action.payload.cart.cartId;
                state.numberOfItems = action.payload.cart.numberOfItems;
                state.error = null;
            })
            .addCase(updateItemQuantity.rejected, (state, action) => {
                state.error = action.payload || "Failed to fetch products";
            })
            .addCase(syncCart.pending, (state) => {
                state.error = null;
            })
            .addCase(syncCart.fulfilled, (state, action) => {
                state.items = action.payload.cart.items;
                state.subTotal = action.payload.cart.subTotal;
                state.cartId = action.payload.cart.cartId;
                state.numberOfItems = action.payload.cart.numberOfItems;
                state.error = null;
            })
            .addCase(syncCart.rejected, (state, action) => {
                state.error = action.payload || "Failed to fetch products";
            });
    },
});

export const {
    addItemOptimistic,
    deleteItemOptimistic,
    changeQuantityOptimistic,
    rollbackCartItems,
    clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
