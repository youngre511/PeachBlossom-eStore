export interface CartItem {
    productNo: string;
    name: string;
    price: number;
    discountPrice: number;
    quantity: number;
    thumbnailUrl: string;
    productUrl: string;
}

export interface CartState {
    items: CartItem[];
    subTotal: number;
    taxRate: number | null;
    tax: number | null;
    shipping: number | null;
    overallDiscount: number;
    promoCode: string | null;
    promoName: string | null;
    cartId: number | null;
    error: string | null;
}

export interface ChangeQuantityRequest {
    productIndex: number;
    adjustmentAmount: number;
}

export interface ActionData {
    productNo: string;
    cartId: string;
}
