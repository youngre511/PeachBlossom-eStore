import Product from "../models/mongo/productModel";
import Category from "../models/mongo/categoryModel";
import * as cartService from "../services/cartService";
import { Request, RequestHandler, Response } from "express";

interface CartIdRequestParams extends Request {
    cartId: string;
}

interface CustomerIdBodyRequest extends Request {
    body: {
        customerId: number;
    };
}

interface MergeCartsRequest extends Request {
    body: {
        cartId1: number;
        cartId2: number;
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

export const getCartById: RequestHandler<CartIdRequestParams> = async (
    req: Request<CartIdRequestParams>,
    res: Response
) => {
    try {
        const { cartId } = req.params;
        const result = await cartService.getCartById(+cartId);

        (res as CartResponse).json({
            message: "success",
            payload: {
                success: true,
                message: "successfully retrieved cart",
                cart: result,
            },
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

export const addToCart: RequestHandler = async (
    req: AddItemRequest,
    res: Response
) => {
    try {
        const { productNo, cartId, quantity, thumbnailUrl } = req.body;
        const result = await cartService.addToCart(
            productNo,
            cartId,
            quantity,
            thumbnailUrl
        );

        (res as CartResponse).json({
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

export const updateItemQuantity: RequestHandler = async (
    req: UpdateQuantityRequest,
    res: Response
) => {
    try {
        const { productNo, cartId, quantity } = req.body;
        const result = await cartService.updateItemQuantity(
            productNo,
            cartId,
            quantity
        );

        (res as CartResponse).json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "update quantity failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};

export const deleteFromCart: RequestHandler = async (
    req: DeleteItemRequest,
    res: Response
) => {
    try {
        const { productNo, cartId } = req.body;
        const result = await cartService.deleteFromCart(productNo, cartId);

        (res as CartResponse).json({
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

export const mergeCarts: RequestHandler = async (
    req: MergeCartsRequest,
    res: Response
) => {
    try {
        const { cartId1, cartId2 } = req.body;
        const result = await cartService.mergeCarts(cartId1, cartId2);

        (res as CartResponse).json({
            message: "success",
            payload: result,
        });
    } catch (error) {
        let errorObj = {
            message: "merge cart failure",
            payload: error,
        };

        console.log(errorObj);

        res.json(errorObj);
    }
};
