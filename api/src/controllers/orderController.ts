import { Request, Response, RequestHandler } from "express";
import * as orderService from "../services/orderService.js";
import { verifyToken } from "../utils/jwt.js";
import { getCustomerIdFromUsername } from "../services/userService.js";

export interface ShippingDetails {
    shippingAddress: string;
    shippingAddress2: string;
    firstName: string;
    lastName: string;
    zipCode: string;
    phoneNumber: string;
    stateAbbr: string;
    city: string;
}
export interface OrderData {
    cartId: number | null;
    customerId?: number;
    shipping: ShippingDetails;
    email: string;
    orderDetails: {
        subTotal: number;
        shipping: number;
        tax: number;
        totalAmount: number;
        items: Array<{
            productNo: string;
            quantity: number;
            priceAtCheckout: number;
        }>;
    };
}

interface PlaceOrderRequest extends Request {
    body: OrderData;
}

interface PlaceOrderResponse extends Response {
    success: boolean;
    message: string;
    orderNo: string;
}

interface GetOneOrderRequest extends Request {
    params: {
        orderNo: string;
    };
    query: {
        email?: string;
    };
}

export interface GetOrdersFilters {
    sort: string;
    orderStatus?: string[];
    search?: string;
    state?: string[];
    customerId?: number;
    startDate?: string;
    endDate?: string;
    page: string;
    itemsPerPage: string;
}

interface GetOrdersRequest extends Request {
    query: {
        sort: string;
        orderStatus?: string[];
        search?: string;
        state?: string[];
        startDate?: string;
        endDate?: string;
        page: string;
        itemsPerPage: string;
    };
}

export interface UpdateItem {
    order_item_id: number;
    quantity: number;
    fulfillmentStatus: string;
}

export interface UpdateOrder {
    orderNo: string;
    subTotal: number;
    shipping: number;
    tax: number;
    totalAmount: number;
    shippingAddress: string;
    stateAbbr: string;
    city: string;
    zipCode: string;
    phoneNumber: string;
    email: string;
    orderStatus: string;
    items: UpdateItem[];
}

interface UpdateOrderRequest extends Request {
    body: UpdateOrder;
}

//// Order Functions
export const placeOrder: RequestHandler = async (
    req: PlaceOrderRequest,
    res: Response
) => {
    try {
        const orderData = req.body;
        if (req.user) {
            const customer_id = await getCustomerIdFromUsername(
                req.user.username
            );
            if (customer_id) {
                orderData.customerId = +customer_id;
            }
        }

        const result = await orderService.placeOrder(orderData);

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
