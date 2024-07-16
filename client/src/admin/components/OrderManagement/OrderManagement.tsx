import React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import OrdersList from "./OrdersList";
import axios, { AxiosError } from "axios";
import "./order-management.css";
import OrderManagementFilters from "./OrderManagementFilters";

export interface AVOrderFilters {
    sort: string;
    orderStatus?: string[];
    search?: string;
    state?: string[];
    startDate?: string;
    endDate?: string;
    page: string;
    itemsPerPage: string;
}

export interface AVOrder {
    order_id: string;
    customer_id: number | null;
    orderNo: string;
    orderDate: Date;
    subTotal: string;
    shipping: string;
    tax: string;
    totalAmount: string;
    shippingAddress: string;
    stateAbbr: string;
    zipCode: string;
    phoneNumber: string;
    email: string;
    orderStatus: string;
}
interface AVOrderResponse {
    totalCount: number;
    orders: AVOrder[];
}

interface Props {}
const OrderManagement: React.FC<Props> = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search");
    const orderStatus = searchParams.get("orderStatus");
    const state = searchParams.get("state");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const page = searchParams.get("page") || "1";
    const sort = searchParams.get("sort") || "orderDate-descend";
    const itemsPerPage = searchParams.get("itemsPerPage") || 24;
    const [results, setResults] = useState<AVOrder[]>([]);
    const [numberOfResults, setNumberOfResults] = useState<number>(0);

    const fetchOrders = async (filters: AVOrderFilters) => {
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}order`,
                {
                    params: filters,
                }
            );
            if (!response.data) {
                throw new Error("No data returned from server");
            }
            const results: AVOrderResponse = response.data;
            setNumberOfResults(results.totalCount);
            setResults(results.orders);
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error(error.message);
            } else {
                console.error(
                    "An unknown error occurred while fetching order data"
                );
            }
        }
    };

    useEffect(() => {
        const initialParams: Record<string, string> = {};

        if (!searchParams.get("sort")) {
            initialParams.sort = "orderDate-ascend";
        }
        if (!searchParams.get("page")) {
            initialParams.page = "1";
        }

        if (!searchParams.get("itemsPerPage")) {
            initialParams.itemsPerPage = "24";
        }

        if (Object.keys(initialParams).length > 0) {
            setSearchParams((prevParams) => {
                const newParams = new URLSearchParams(prevParams);
                Object.keys(initialParams).forEach((key) => {
                    if (!newParams.get(key)) {
                        newParams.set(key, initialParams[key]);
                    }
                });
                return newParams;
            });
        } else {
            //Construct filters obj
            const params: AVOrderFilters = {
                page: page,
                itemsPerPage: String(itemsPerPage),
                sort: sort,
            };

            if (state) params["state"] = state.split(",");
            if (search) params["search"] = search;
            if (orderStatus) params["orderStatus"] = orderStatus.split(",");
            if (startDate) params["startDate"] = startDate;
            if (endDate) params["endDate"] = endDate;
            console.log("params:", params);
            //FetchLogic
            fetchOrders(params);
        }

        //FetchLogic
        // const currentFilters = Object.values(memoParams).map((value) =>
        //     value ? value.toString() : ""
        // );
        // const existingFilters = Object.values({
        //     ...avCatalog.filters,
        // }).map((value) => (value ? value.toString() : ""));
        // const filtersChanged = !arraysEqual(
        //     currentFilters,
        //     existingFilters
        // );
        // if (filtersChanged) {
        //     dispatch(avFetchProducts(params as AVFilters));
        // }
    }, [
        search,
        orderStatus,
        state,
        page,
        startDate,
        endDate,
        sort,
        itemsPerPage,
    ]);

    useEffect(() => {
        const initialParams: Record<string, string> = {};

        if (!searchParams.get("sort")) {
            initialParams.sort = "orderDate-ascend";
        }
        if (!searchParams.get("page")) {
            initialParams.page = "1";
        }

        if (!searchParams.get("itemsPerPage")) {
            initialParams.itemsPerPage = "24";
        }

        if (Object.keys(initialParams).length > 0) {
            setSearchParams((prevParams) => {
                const newParams = new URLSearchParams(prevParams);
                Object.keys(initialParams).forEach((key) => {
                    if (!newParams.get(key)) {
                        newParams.set(key, initialParams[key]);
                    }
                });
                return newParams;
            });
        }
    }, [searchParams, setSearchParams]);

    const updateSearchParams = (newFilters: Record<string, string>): void => {
        Object.keys(newFilters).forEach((key) => {
            const value = newFilters[key];
            if (value) {
                searchParams.set(key, value as string);
            } else {
                searchParams.delete(key);
            }
        });
        setSearchParams(searchParams);
    };

    return (
        <div className="product-management">
            <h1>Order Management</h1>
            <OrderManagementFilters updateSearchParams={updateSearchParams} />
            <OrdersList
                page={+page}
                results={results}
                numberOfResults={numberOfResults}
                updateSearchParams={updateSearchParams}
            />
        </div>
    );
};
export default OrderManagement;
