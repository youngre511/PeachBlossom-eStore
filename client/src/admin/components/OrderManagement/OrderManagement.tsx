import React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import OrdersList from "./OrdersList";
import axios, { AxiosError } from "axios";
import "./order-management.css";
import OrderManagementFilters from "./OrderManagementFilters";
import { ApiResponse } from "../AddProduct/AddProduct";

export interface AVOrderFilters {
    sort: string;
    orderStatus?: string[];
    search?: string;
    state?: string[];
    earliestOrderDate?: string;
    latestOrderDate?: string;
    page: string;
    itemsPerPage: string;
}

export interface AVOrder {
    order_id: number;
    customer_id: number | null;
    orderNo: string;
    orderDate: Date;
    subTotal: number;
    shipping: number;
    tax: number;
    totalAmount: number;
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
    const orderStatus = searchParams.get("status");
    const state = searchParams.get("state");
    const dateMin = searchParams.get("dateMin");
    const dateMax = searchParams.get("dateMax");
    const page = searchParams.get("page") || "1";
    const sort = searchParams.get("sort") || "name-ascend";
    const itemsPerPage = searchParams.get("itemsPerPage") || 24;
    const [results, setResults] = useState<AVOrder[]>([]);
    const [numberOfResults, setNumberOfResults] = useState<number>(0);

    const fetchOrders = async (filters: AVOrderFilters) => {
        try {
            const response: ApiResponse<AVOrderResponse> = await axios.get(
                `${process.env.REACT_APP_API_URL}order`,
                {
                    params: filters,
                }
            );
            console.log(response);
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
            const params = {
                search,
                orderStatus,
                state,
                sort,
                page,
                dateMin,
                dateMax,
                itemsPerPage,
            };
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
        }
    }, [
        search,
        orderStatus,
        state,
        page,
        dateMin,
        dateMax,
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
