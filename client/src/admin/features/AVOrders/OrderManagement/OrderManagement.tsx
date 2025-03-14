import React from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import OrdersList from "./components/OrdersList";

import "./order-management.css";
import OrderManagementFilters from "./components/OrderManagementFilters";
import { IAVOrderFilters, IAVOrder } from "../avOrdersTypes";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { avFetchOrders } from "../avOrdersSlice";
import { RootState } from "../../../store/store";
import SearchField from "../../../../common/components/Fields/SearchField";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";

interface AVOrderResponse {
    totalCount: number;
    orders: IAVOrder[];
}

const inputStyle = {
    "&.MuiInputBase-root": {
        backgroundColor: "white",
        "&.MuiFilledInput-root": {
            backgroundColor: "white",
            "&.Mui-disabled": {
                backgroundColor: "peach.light",
            },
        },
    },
    "& .MuiInputBase-root.MuiOutlinedInput-root.MuiInputBase-colorPrimary": {
        backgroundColor: "white",
    },
};

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
    const avOrder = useAppSelector((state: RootState) => state.avOrder);
    const numberOfResults = avOrder.numberOfResults;
    const results = avOrder.orderList;
    const dispatch = useAppDispatch();
    const { width } = useWindowSizeContext();

    useEffect(() => {
        const initialParams: Record<string, string> = {};

        if (!searchParams.get("sort")) {
            initialParams.sort = "orderDate-descend";
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
            const params: IAVOrderFilters = {
                page: page,
                itemsPerPage: String(itemsPerPage),
                sort: sort,
            };

            if (state) params["state"] = state.split(",");
            if (search) params["search"] = search;
            if (orderStatus) params["orderStatus"] = orderStatus.split(",");
            if (startDate) params["startDate"] = startDate;
            if (endDate) params["endDate"] = endDate;

            dispatch(avFetchOrders({ filters: params }));
        }
    }, [
        search,
        orderStatus,
        state,
        page,
        startDate,
        endDate,
        sort,
        itemsPerPage,
        searchParams,
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
            <div className="om-header">
                <div className="om-head-and-search">
                    <h1>Order Management</h1>
                    {width && width >= 1000 && (
                        <div className="om-search-bar">
                            <SearchField
                                updateSearchParams={updateSearchParams}
                                sx={{ ...inputStyle }}
                                options={[]}
                            />
                        </div>
                    )}
                </div>
                <OrderManagementFilters
                    updateSearchParams={updateSearchParams}
                    inputStyle={inputStyle}
                />
            </div>
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
