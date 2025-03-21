import Product from "../models/mongo/productModel.js";
import Category from "../models/mongo/categoryModel.js";
import * as cartService from "../services/cartService.js";
import { Request, RequestHandler, Response } from "express";
import { verifyToken } from "../utils/jwt.js";
import { getCustomerIdFromUsername } from "../services/userService.js";
import {
    AddItemRequest,
    CartIdRequestParams,
    CartResponse,
    DeleteItemRequest,
    UpdateQuantityRequest,
} from "./_controllerTypes.js";

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

export const getCustomerCart: RequestHandler = async (
    req: Request,
    res: Response
) => {
    try {
        if (!req.user) {
            throw new Error("No valid token/username provided.");
        }
        const { username } = req.user;
        const customerId = getCustomerIdFromUsername(username);
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
        let customerId = null;
        if (req.user) {
            const customer_id = await getCustomerIdFromUsername(
                req.user.username
            );
            if (customer_id) {
                customerId = +customer_id;
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
