export interface IAVOrderFilters {
    sort: string;
    orderStatus?: string[];
    search?: string;
    state?: string[];
    startDate?: string;
    endDate?: string;
    page: string;
    itemsPerPage: string;
}

export interface IAVOrder {
    order_id: string;
    customer_id: number | null;
    orderNo: string;
    orderDate: Date;
    subTotal: string;
    shipping: string;
    city: string;
    tax: string;
    totalAmount: string;
    shippingAddress: string;
    stateAbbr: string;
    zipCode: string;
    phoneNumber: string;
    email: string;
    orderStatus: string;
}

export interface IAVOrderItem {
    order_item_id: number;
    order_id: number;
    productNo: string;
    Product: {
        id: number;
        productNo: string;
        productName: string;
        price: number;
        description: string;
        category_id: number;
        subCategory_id?: number;
        thumbnailUrl?: string;
        createdAt: Date;
        updatedAt: Date;
        status: string;
    };
    quantity: number;
    priceWhenOrdered: number;
    fulfillmentStatus: string;
}

export interface IAVOrderDetails extends IAVOrder {
    OrderItem: IAVOrderItem[];
}

export interface AVOrderState {
    orderFilters: IAVOrderFilters;
    orderList: IAVOrder[];
    numberOfResults: number;
    orderDetails: { orderNo: string; details: IAVOrderDetails } | null;
    loading: boolean;
    error: string | null;
}

export interface AVFetchOrdersResponse {
    orderFilters: IAVOrderFilters;
    numberOfResults: number;
    orderList: IAVOrder[];
}

export interface AVFetchOrdersAPIResponse {
    totalCount: number;
    orders: IAVOrder[];
}

export interface AVFetchOrderDetailsResponse {
    orderNo: string;
    details: IAVOrderDetails;
}
