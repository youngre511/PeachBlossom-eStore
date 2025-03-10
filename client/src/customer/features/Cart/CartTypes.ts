export interface CartItem {
    discountPrice: number | null;
    maxAvailable: number;
    name: string;
    price: number;
    productNo: string;
    quantity: number;
    thumbnailUrl: string;
}

export interface CartState {
    cartChangesMade: boolean;
    cartId: number | null;
    error: string | null;
    expirationTime: string | null;
    items: CartItem[];
    numberOfItems: number;
    subTotal: number;
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

export interface UpdateActionData {
    productNo: string;
    cartId: number;
    quantity: number;
}

export interface DeleteActionData {
    productNo: string;
    cartId: number;
}

export interface UpdateQuantityArgs {
    productNo: string;
    newQuantity: number;
}
export interface CartResponsePayload {
    success: boolean;
    message: string;
    cart: {
        items: CartItem[];
        subTotal: number;
        cartId: number;
        numberOfItems: number;
    };
}

export interface CartResponse {
    message: string;
    payload: CartResponsePayload;
}

export interface HoldResponsePayload {
    expirationTime: string;
    cart: {
        items: CartItem[];
        subTotal: number;
        cartId: number;
        numberOfItems: number;
    };
    cartChangesMade: boolean;
}

export interface HoldResponse {
    message: string;
    payload: HoldResponsePayload;
}

export interface MergeActionData {
    cartId1: number;
    cartId2: number;
}
