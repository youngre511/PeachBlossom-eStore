import { ShippingDetails } from "../../store/userData/UserDataTypes";

export interface PaymentDetails {
    cardType: string;
    cardHolder: string;
    cardNumber: string;
    cvv: string;
    expiryDate: string;
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
