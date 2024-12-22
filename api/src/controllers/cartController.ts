import Product from "../models/mongo/productModel.js";
import Category from "../models/mongo/categoryModel.js";
import * as cartService from "../services/cartService.js";
import { Request, RequestHandler, Response } from "express";
import { verifyToken } from "../utils/jwt.js";

interface CartIdRequestParams extends Request {
    cartId: string;
}

interface CustomerCartRequestParams extends Request {
    customerId: string;
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

export const getCartById: RequestHandler<CartIdRequestParams> = async (
    req: Request<CartIdRequestParams>,
    res: Response
) => {
    try {
        const { cartId } = req.params;
        const result = await cartService.getCart({ cartId: +cartId });

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

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const getCustomerCart: RequestHandler<
    CustomerCartRequestParams
> = async (req: Request<CustomerCartRequestParams>, res: Response) => {
    try {
        const { customerId } = req.params;
        const result = await cartService.getCart({ customerId: +customerId });

        (res as CartResponse).json({
            message: "success",
            payload: {
                success: true,
                message: "successfully retrieved customer cart",
                cart: result,
            },
        });
    } catch (error) {
        let errorObj = {
            message: "get customer cart failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const addToCart: RequestHandler = async (
    req: AddItemRequest,
    res: Response
) => {
    try {
        // Check token here instead of using middleware because the action is valid with or without a token. AuthMiddleware is designed to prevent access without a token.
        const token = req.headers.authorization?.split(" ")[1];
        let customerId = null;
        if (token && token !== "null") {
            const decoded = verifyToken(token);
            if (decoded && decoded.customer_id) {
                customerId = decoded.customer_id;
            }
        }

        const { productNo, cartId, quantity, thumbnailUrl } = req.body;

        const result = await cartService.addToCart(
            productNo,
            cartId,
            quantity,
            thumbnailUrl,
            customerId
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

        console.error(errorObj);

        res.status(500).json(errorObj);
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

        console.error(errorObj);

        res.status(500).json(errorObj);
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

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};
