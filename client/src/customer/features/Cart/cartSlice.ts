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
    HoldResponsePayload,
    HoldResponse,
} from "./CartTypes";
import { RootState } from "../../store/customerStore";
import axios from "axios";
import { logActivity } from "../../store/userData/userDataTrackingThunks";

const initialState: CartState = {
    items: [],
    subTotal: 0,
    numberOfItems: 0,
    cartId: null,
    error: null,
    expirationTime: null,
    cartChangesMade: false,
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
        const token = localStorage.getItem("jwtToken");
        let productThumbnail: string | null = null;

        // Log action
        dispatch(logActivity({ activityType: "cartAdd", productNo }));

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
                actionData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                    withCredentials: true,
                }
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

export const holdCartStock = createAsyncThunk<
    HoldResponsePayload,
    void,
    { state: RootState; rejectValue: string }
>("cart/holdCartStock", async (_, { getState, rejectWithValue }) => {
    try {
        const state = getState() as RootState;
        const response = await axios.put<HoldResponse>(
            `${import.meta.env.VITE_API_URL}/inventory/holdStock`,
            { cartId: state.cart.cartId }
        );

        return response.data.payload;
    } catch (error: any) {
        return rejectWithValue(
            error.response?.data || ("Error reserving cart items" as string)
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
            console.log("set id:", state.cartId);
        },
        setExpirationTime: (
            state,
            action: PayloadAction<{ expiration: string | null }>
        ) => {
            state.expirationTime = action.payload.expiration;
        },
        setCartChangesMade: (state, action: PayloadAction<boolean>) => {
            state.cartChangesMade = action.payload;
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
            })
            .addCase(holdCartStock.pending, (state) => {
                state.error = null;
            })
            .addCase(holdCartStock.fulfilled, (state, action) => {
                state.items = action.payload.cart.items;
                state.subTotal = action.payload.cart.subTotal;
                state.cartId = action.payload.cart.cartId;
                state.numberOfItems = action.payload.cart.numberOfItems;
                state.expirationTime = action.payload.expirationTime;
                state.cartChangesMade = action.payload.cartChangesMade;
                state.error = null;
            })
            .addCase(holdCartStock.rejected, (state, action) => {
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
    setCartChangesMade,
} = cartSlice.actions;
export default cartSlice.reducer;
