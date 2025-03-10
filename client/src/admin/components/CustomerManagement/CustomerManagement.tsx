import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import "./customer-management.css";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import {
    clearError,
    deleteUser,
    fetchCustomers,
    resetUserPassword,
} from "../../features/Users/userSlice";
import { RootState } from "../../store/store";
import { Button, Icon, InputLabel, MenuItem, Select } from "@mui/material";
import GoldButton from "../../../common/components/GoldButton";
import BlankPopup from "../../../common/components/BlankPopup";
import CustomerList from "./CustomerList";
import AddCircleOutlineSharpIcon from "@mui/icons-material/AddCircleOutlineSharp";
import VisibilitySharpIcon from "@mui/icons-material/VisibilitySharp";
import SearchField from "../../../common/components/Fields/SearchField";

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

const CustomerManagement: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search");
    const page = searchParams.get("page") || "1";
    const usersPerPage = searchParams.get("usersPerPage") || "24";
    const users = useAppSelector((state: RootState) => state.users);
    const numberOfResults = users.numberOfCustomers;
    const results = users.customers;
    const [loading, setLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [justLoaded, setJustLoaded] = useState<boolean>(true);
    const [deleteId, setDeleteId] = useState<number | null>(null);

    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    useEffect(() => {
        setLoading(users.loading);
    }, [users.loading]);

    // Fetch data on page load then set justLoaded state to false to prevent future automatic fetches.
    useEffect(() => {
        if (!loading && justLoaded) {
            fetchCustomerData();
            setJustLoaded(false);
        }
    }, [loading, justLoaded]);

    useEffect(() => {
        if (users.error) {
            setIsError(true);
            console.error(users.error);
        }
        setErrorMessage(users.error);
    }, [users.error]);

    // Fetch data if access view selection changes
    useEffect(() => {
        fetchCustomerData();
    }, [searchParams, search, page, usersPerPage]);

    // Construct formatted params and dispatch fetch request to slice.
    const fetchCustomerData = () => {
        const initialParams: Record<string, string> = {};

        if (!searchParams.get("page")) {
            initialParams.page = "1";
        }

        if (!searchParams.get("usersPerPage")) {
            initialParams.usersPerPage = "24";
        }

        if (!searchParams.get("accessLevel")) {
            initialParams.accessLevel = "all";
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
            console.log(usersPerPage);
            const params = {
                page: page,
                usersPerPage: usersPerPage,
                searchString: search ? search : undefined,
            };
            dispatch(fetchCustomers(params));
        }
    };

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

    const handleUserDelete = (user_id: number) => {
        setDeleteId(user_id);
        setShowConfirm(true);
    };

    const dispatchUserDelete = () => {
        if (!deleteId) {
            setErrorMessage("Something went wrong. No user_id to delete.");
            setIsError(true);
        } else {
            dispatch(deleteUser({ user_id: deleteId, userRole: "customer" }));
        }
    };

    const handleResetPassword = (user_id: number) => {
        dispatch(resetUserPassword({ user_id, userRole: "customer" }));
    };

    return (
        <div className="customer-management">
            <div className="customer-manage-header">
                <h1>Customer Management</h1>
            </div>
            <div className="customer-search-bar-container">
                <div className="customer-search-bar">
                    <SearchField
                        updateSearchParams={updateSearchParams}
                        sx={inputStyle}
                        inputSx={{ backgroundColor: "white" }}
                        options={[]}
                    />
                </div>
            </div>
            <CustomerList
                page={+page}
                results={results}
                numberOfResults={numberOfResults}
                updateSearchParams={updateSearchParams}
                handleUserDelete={handleUserDelete}
                handleResetPassword={handleResetPassword}
            />
            {showConfirm && (
                <BlankPopup>
                    <div>Delete user {deleteId}?</div>
                    <div className="confirm-buttons">
                        <Button
                            onClick={() => {
                                dispatchUserDelete();
                                setShowConfirm(false);
                            }}
                            variant="contained"
                        >
                            Yes
                        </Button>
                        <Button
                            onClick={() => {
                                setDeleteId(null);
                                setShowConfirm(false);
                            }}
                            sx={{ marginLeft: "10px" }}
                            variant="outlined"
                        >
                            No, wait!
                        </Button>
                    </div>
                </BlankPopup>
            )}
            {isError && (
                <BlankPopup>
                    <span>{errorMessage}</span>
                    <Button
                        onClick={() => {
                            dispatch(clearError());
                            setIsError(false);
                        }}
                    >
                        OK
                    </Button>
                </BlankPopup>
            )}
        </div>
    );
};
export default CustomerManagement;
