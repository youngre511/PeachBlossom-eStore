import React, { useContext } from "react";
import "./customer-orders.css";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/customerStore";
import { getUserOrders } from "../../features/UserData/userDataSlice";
import { AuthContext } from "../../../common/contexts/authContext";
import { useSearchParams } from "react-router-dom";
import { CustomerOrderFilter } from "../../features/UserData/UserDataTypes";
import CustomerOrderRow from "./CustomerOrderRow";
import PageSelector from "../Shop/PageSelector";
import SortMethodSelector from "../../features/SortMethodSelector/SortMethodSelector";
import { InputLabel } from "@mui/material";

interface CustomerOrdersProps {}
const CustomerOrders: React.FC<CustomerOrdersProps> = () => {
    const userData = useAppSelector((state: RootState) => state.userData);
    const filters = userData.data.orderFilter;
    const numberOfResults = userData.data.numberResults;
    const orders = userData.data.orderList;
    const auth = useContext(AuthContext);
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = searchParams.get("page") || "1";
    const sort = searchParams.get("sort") || "orderDate-descend";

    const validSortMethods = [
        "orderDate-ascend",
        "orderDate-descend",
        "totalAmount-ascend",
        "totalAmount-descend",
        "stateAbbr-ascend",
        "stateAbbr-descend",
        "orderNo-ascend",
        "orderNo-descend",
    ];

    const fetchOrders = (filter: CustomerOrderFilter) => {
        if (auth && auth.user && auth.user.customer_id) {
            dispatch(
                getUserOrders({
                    customerId: auth.user.customer_id,
                    filter,
                    force: true,
                })
            );
        }
    };

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
            const params: CustomerOrderFilter = {
                page: page,
                sort: sort,
            };

            fetchOrders(params);
        }
    }, [page, sort, searchParams]);

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
        <div className="order-history">
            <div className="order-header">
                <h1>Orders</h1>
            </div>
            <div className="past-orders">
                <div className="orders-container">
                    {orders.length === 0 ? (
                        <div>You have no past orders.</div>
                    ) : (
                        orders.map((order) => (
                            <CustomerOrderRow
                                order={order}
                                key={order.orderNo}
                            />
                        ))
                    )}
                </div>
            </div>
            <PageSelector
                numberOfResults={numberOfResults}
                currentPage={+page}
                updateSearchParams={updateSearchParams}
                itemsPerPage={10}
            />
        </div>
    );
};
export default CustomerOrders;
