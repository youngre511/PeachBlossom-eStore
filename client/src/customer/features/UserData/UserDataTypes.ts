export interface UserDataState {
    data: {
        orderList: CustomerOrder[];
        addressList: CustomerAddress[];
    };
    preferences: {
        itemsPerPage: 24 | 48 | 96;
    };
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
}

export interface CustomerAddress {
    nickName: string | null;
    shippingAddress1: string;
    shippingAddress2: string;
    city: string;
    stateAbbr: string;
    zipCode: string;
    phoneNumber: string;
}
