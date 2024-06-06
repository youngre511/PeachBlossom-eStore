import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { CartItem, CartState } from "./CartTypes";
import { RootState } from "../../store/store";
import axios from 'axios'
import { useAppDispatch } from '../../hooks/reduxHooks';
const dispatch = useAppDispatch()

const initialState: CartState = {
    items: [],
    subTotal: 0,
    taxRate: null,
    tax: null,
    shipping: null,
    overallDiscount: 0,
    promoCode: null,
    promoName: null,
    cartId: null,
    error: null
};

//Thunks//

export const addProductToCart = createAsyncThunk<
    CartState,
    string,
    { state: RootState; rejectValue: string }
>(
    "cart/addProductToCart",
    async (productNumber: string, { getState, dispatch, rejectWithValue }) => {
        const productToAdd = getState().catalogue.products.items.find(p => p.id === productNo);
        if (!productToAdd) {
            return rejectWithValue('Product not found')
        }
    };

    dispatch(addItemOptimistic(productToAdd))

    try {
        const response = await axios.put<CartState>('https://api.peachblossom.ryanyoung.codes/')
        return data;
    } catch (error) {

    }

);

//Slice//

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
    extraReducers: (builder) => {
        builder
            .addCase(addProductToCart.pending, (state) => {
                state.error = null;
            })
            .addCase(addProductToCart.fulfilled, (state, action) => {
                state.items = action.payload.items;
                state.subTotal = action.payload.subTotal;
                state.taxRate = action.payload.taxRate;
                state.tax = action.payload.tax;
                state.shipping = action.payload.shipping;
                state.cartId = action.payload.cartId;
                state.error = null    
            })
            .addCase(addProductToCart.rejected, (state, action) => {
                state.error =
                    action.error.message || "Failed to fetch products";
            });
    },
});

export const { addItemOptimistic, removeItemOptimistic, clearCart } =
    cartSlice.actions;
export default cartSlice.reducer;
