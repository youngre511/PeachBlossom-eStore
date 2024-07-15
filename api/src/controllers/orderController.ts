import { Request, Response, RequestHandler } from "express";
import * as orderService from "../services/orderService.js";

interface ShippingDetails {
    shippingAddress: string;
    shippingAddress2: string;
    firstName: string;
    lastName: string;
    zipCode: string;
    phoneNumber: string;
    state: string;
    city: string;
}
export interface OrderData {
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
    earliestOrderDate?: string;
    latestOrderDate?: string;
    page: string;
    itemsPerPage: string;
}

interface GetOrdersRequest extends Request {
    query: {
        sort: string;
        orderStatus?: string[];
        search?: string;
        state?: string[];
        earliestOrderDate?: string;
        latestOrderDate?: string;
        page: string;
        itemsPerPage: string;
    };
}

//// Order Functions
export const placeOrder: RequestHandler = async (
    req: PlaceOrderRequest,
    res: Response
) => {
    try {
        const orderData = req.body;
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
        const result = await orderService.getOneOrder(orderNo, email);

        // (res as PlaceOrderResponse).json(result);
        res.json(result);
    } catch (error) {
        let errorObj = {
            message: "get one order failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const getOrders = async (req: GetOrdersRequest, res: Response) => {
    try {
        const result = await orderService.getOrders(req.query);

        // (res as PlaceOrderResponse).json(result);
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
