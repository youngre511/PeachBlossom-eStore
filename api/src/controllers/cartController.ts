import Product from "../models/mongo/productModel";
import Category from "../models/mongo/categoryModel";
const cartService = require("../services/cartService");
import { Request, Response } from "express";

interface CartIdBodyRequest extends Request {
    body: {
        cartId: number;
    };
}

interface CustomerIdBodyRequest extends Request {
    body: {
        customerId: number;
    };
}

interface AddItemRequest extends Request {
    body: {
        productNo: string;
        cartId: number | null;
        quantity: number;
        thumbnailUrl: string;
    };
}

interface UpdateQuantityRequest extends Request {
    body: {
        productNo: string;
        cartId: number;
        quantity: number;
    };
}

interface DeleteItemRequest extends Request {
    body: {
        productNo: string;
        cartId: number;
    };
}

interface CartItemResponse {
    productNo: string;
    name: string;
    price: number;
    discountPrice: number;
    quantity: number;
    thumbnailUrl: string;
    productUrl: string;
}

interface CartResponsePayload {
    items: CartItemResponse[];
    subTotal: number;
    cartId: number;
    numberOfItems: number;
}

interface CartResponse extends Response {
    message: string;
    payload: CartResponsePayload;
}

exports.getCartById = async (req: CartIdBodyRequest, res: CartResponse) => {
    try {
        const { cartId } = req.body;
        const result = await cartService.getCartById(cartId);

        res.json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "get Cart by ID failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

exports.addToCart = async (req: AddItemRequest, res: CartResponse) => {
    try {
        const { productNo, cartId, quantity, thumbnailUrl } = req.body;
        const result = await cartService.addToCart(
            productNo,
            cartId,
            quantity,
            thumbnailUrl
        );

        res.json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "add to cart failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

exports.updateItemQuantity = async (
    req: UpdateQuantityRequest,
    res: CartResponse
) => {
    try {
        const { productNo, cartId, quantity } = req.body;
        const result = await cartService.updateItemQuantity(
            productNo,
            cartId,
            quantity
        );

        res.json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "remove from cart failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

exports.deleteFromCart = async (req: DeleteItemRequest, res: CartResponse) => {
    try {
        const { productNo, cartId } = req.body;
        const result = await cartService.deleteFromCart(productNo, cartId);

        res.json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "remove from cart failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};
