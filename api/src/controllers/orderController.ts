import { Request, Response, RequestHandler } from "express";
import * as orderService from "../services/orderService";

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

        console.log(errorObj);

        res.json(errorObj);
    }
};
