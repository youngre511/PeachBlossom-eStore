export interface CartItem {
    productNo: string;
    name: string;
    price: number;
    discountPrice: number | null;
    quantity: number;
    thumbnailUrl: string;
    productUrl: string;
}

export interface CartState {
    items: CartItem[];
    subTotal: number;
    numberOfItems: number;
    // taxRate: number | null;
    // tax: number | null;
    // shipping: number | null;
    // overallDiscount: number;
    // promoCode: string | null;
    // promoName: string | null;
    cartId: number | null;
    error: string | null;
}

export interface ChangeQuantityRequest {
    productIndex: number;
    adjustmentAmount: number;
}

export interface AddActionData {
    productNo: string;
    cartId: number | null;
    quantity: number;
    thumbnailUrl: string | null;
}

export interface RemoveActionData {
    productNo: string;
    cartId: number;
    quantity: number;
}
