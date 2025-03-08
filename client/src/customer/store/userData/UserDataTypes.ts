export interface UserDataState {
    data: {
        orderList: CustomerOrder[];
        numberResults: number;
        addressList: CustomerAddress[];
        orderFilter: CustomerOrderFilter;
        currentOrderNo: string | null;
        recentlyViewed: RecentView[];
    };

    preferences: {
        itemsPerPage: 24 | 48 | 96;
        allowTracking: boolean;
    };
    activity: ActivityRecord[];
    loading: boolean;
    error: string | null;
}

export type ActivityType = "productView" | "search" | "cartAdd" | "purchase";

export interface ActivityRecord {
    activityType: ActivityType;
    timestamp: string;
    productNo?: string;
    searchTerm?: string;
}

export interface RecentViewInput {
    productNo: string;
    thumbnailUrl: string;
    productName: string;
}

export interface RecentView extends RecentViewInput {
    timestamp: string;
}

export interface CustomerOrder {
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
    numberOfItems: number;
    thumbnailUrl: string;
}

export interface OrdersResponse {
    filter: CustomerOrderFilter;
    numberOfResults: number;
    orders: CustomerOrder[];
}

export interface CustomerAddress {
    address_id: number;
    nickname: string | null;
    firstName: string;
    lastName: string;
    shippingAddress1: string;
    shippingAddress2: string;
    city: string;
    stateAbbr: string;
    zipCode: string;
    phoneNumber: string;
}

export interface CustomerOrderFilter {
    sort: string;
    orderStatus?: string[];
    search?: string;
    state?: string[];
    startDate?: string;
    endDate?: string;
    page: string;
}

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
