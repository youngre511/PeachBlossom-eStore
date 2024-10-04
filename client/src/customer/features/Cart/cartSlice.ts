import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import {
    AddActionData,
    UpdateActionData,
    DeleteActionData,
    CartItem,
    CartState,
    ChangeQuantityRequest,
    UpdateQuantityArgs,
    CartResponsePayload,
    CartResponse,
    MergeActionData,
} from "./CartTypes";
import { RootState } from "../../store/customerStore";
import axios from "axios";

const initialState: CartState = {
    items: [],
    subTotal: 0,
    numberOfItems: 0,
    cartId: null,
    error: null,
    expirationTime: null,
};

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
                maxAvailable: productToAdd.stock,
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
                `${import.meta.env.VITE_API_URL}/cart/add-to-cart`,
                actionData
            );

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
    UpdateQuantityArgs,
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
                    `${import.meta.env.VITE_API_URL}/cart/update-quantity`,
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
                    `${import.meta.env.VITE_API_URL}/cart/delete-from-cart`,
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
    void,
    { state: RootState; rejectValue: string }
>("cart/syncCart", async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState() as RootState;
        const response = await axios.get<CartResponse>(
            `${import.meta.env.VITE_API_URL}/cart/cartId/${state.cart.cartId}`
        );
        return response.data.payload;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data || ("Error removing item from cart" as string)
        );
    }
});

export const mergeCart = createAsyncThunk<
    CartResponsePayload,
    number,
    { state: RootState; rejectValue: string }
>("cart/mergeCart", async (cartId, { getState, rejectWithValue }) => {
    console.log("running merge cart");
    try {
        const state = getState() as RootState;
        if (state.cart.cartId) {
            const actionData: MergeActionData = {
                cartId1: cartId,
                cartId2: state.cart.cartId,
            };
            const response = await axios.put<CartResponse>(
                `${import.meta.env.VITE_API_URL}/cart/merge-carts`,
                actionData
            );
            return response.data.payload;
        } else {
            throw new Error("No cart to merge with. Sync cart instead.");
        }
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
            state.expirationTime = null;
        },
        setCartId: (state, action: PayloadAction<{ cartId: number }>) => {
            state.cartId = action.payload.cartId;
        },
        setExpirationTime: (
            state,
            action: PayloadAction<{ expiration: string | null }>
        ) => {
            state.expirationTime = action.payload.expiration;
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
                console.log(action.payload.cart.subTotal);
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
            })
            .addCase(mergeCart.pending, (state) => {
                state.error = null;
            })
            .addCase(mergeCart.fulfilled, (state, action) => {
                state.items = action.payload.cart.items;
                state.subTotal = action.payload.cart.subTotal;
                state.cartId = action.payload.cart.cartId;
                state.numberOfItems = action.payload.cart.numberOfItems;
                state.error = null;
            })
            .addCase(mergeCart.rejected, (state, action) => {
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
    setCartId,
    setExpirationTime,
} = cartSlice.actions;
export default cartSlice.reducer;
