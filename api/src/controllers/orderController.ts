import { Response, RequestHandler } from "express";
import * as orderService from "../services/orderService.js";
import { getCustomerIdFromUsername } from "../services/userService.js";
import {
    GetOneOrderRequest,
    GetOrdersRequest,
    PlaceOrderRequest,
    PlaceOrderResponse,
    UpdateOrderRequest,
} from "./_controllerTypes.js";

//// Order Functions
export const placeOrder: RequestHandler = async (
    req: PlaceOrderRequest,
    res: Response
) => {
    try {
        const { orderData, save } = req.body;
        if (req.user) {
            const customer_id = await getCustomerIdFromUsername(
                req.user.username
            );
            if (customer_id) {
                orderData.customerId = +customer_id;
            }
        }

        const result = await orderService.placeOrder(orderData, save || false);

        (res as PlaceOrderResponse).json(result);
    } catch (error) {
        let errorObj = {
            message: "place order failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const getOneOrder = async (req: GetOneOrderRequest, res: Response) => {
    try {
        const { orderNo } = req.params;
        const { email } = req.query;

        const result = await orderService.getOneOrder({
            orderNo,
            email,
            customerId: null,
            loggedIn: false,
        });
        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Surrogate-Control", "no-store");

        // (res as PlaceOrderResponse).json(result);
        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "get one order failure",
            reason: error instanceof Error ? error.message : String(error),
        };
        console.log(errorObj);
        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const getOneCustomerOrder = async (
    req: GetOneOrderRequest,
    res: Response
) => {
    try {
        const { orderNo } = req.params;

        if (!req.user) {
            throw new Error("No user token");
        }

        const customer_id = await getCustomerIdFromUsername(req.user.username);

        if (!customer_id) {
            throw new Error("No customer id supplied");
        }

        const result = await orderService.getOneOrder({
            orderNo,
            email: undefined,
            customerId: +customer_id,
            loggedIn: true,
        });
        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Surrogate-Control", "no-store");

        // (res as PlaceOrderResponse).json(result);
        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "get one customer order failure",
            reason: error instanceof Error ? error.message : String(error),
        };
        console.log(errorObj);
        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const getOrders = async (req: GetOrdersRequest, res: Response) => {
    try {
        const result = await orderService.getOrders(req.query);
        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "get orders failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const getCustomerOrders = async (
    req: GetOrdersRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            throw new Error("No user token provided");
        }
        console.log("USERNAME:", req.user.username);
        const customerId = await getCustomerIdFromUsername(req.user.username);
        if (!customerId) {
            throw new Error("Unable to extract customerId from username");
        }
        const result = await orderService.getOrders(req.query, +customerId);
        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "get orders failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const updateOrder = async (req: UpdateOrderRequest, res: Response) => {
    try {
        console.log("req.body:", req.body);
        const result = await orderService.updateOrder(req.body);

        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "update order failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};
