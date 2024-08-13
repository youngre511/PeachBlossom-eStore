import React, { useMemo } from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import UserList from "./AdminList";
import axios, { AxiosError } from "axios";
import "./admin-management.css";
import {
    IAVOrderFilters,
    IAVOrder,
} from "../../features/AVOrders/avOrdersTypes";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import {
    changeAccessLevelOptimistic,
    clearError,
    deleteUser,
    fetchAdmins,
    resetUserPassword,
    rollbackAccessLevel,
} from "../../features/Users/userSlice";
import { RootState } from "../../store/store";
import {
    Button,
    FormControl,
    FormControlLabel,
    FormLabel,
    InputLabel,
    MenuItem,
    Radio,
    RadioGroup,
    Select,
    TextField,
} from "@mui/material";
import PeachButton from "../../../common/components/PeachButton";
import StatusPopup from "../../../common/components/StatusPopup";
import BlankPopup from "../../../common/components/BlankPopup";
import { FormField } from "../../../common/components/Fields/FormField";
import { inputStyle } from "../AddProduct/AddProduct";
import AddAdminPopup from "./AddAdminPopup";
import AdminList from "./AdminList";

interface FetchAdminParams {
    page: string;
    usersPerPage: string;
    accessLevel: string[];
}

interface Props {}
const AdminManagement: React.FC<Props> = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search");
    const page = searchParams.get("page") || "1";
    const usersPerPage = searchParams.get("usersPerPage") || "24";
    const accessLevel = searchParams.get("accessLevel") || "all";
    const users = useAppSelector((state: RootState) => state.users);
    const numberOfResults = users.numberOfAdmins;
    const results = users.admins;
    const [loading, setLoading] = useState<boolean>(true);
    const [isError, setIsError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [justLoaded, setJustLoaded] = useState<boolean>(false);
    const [accessView, setAccessView] = useState<string>("all");
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [addingUser, setAddingUser] = useState<boolean>(false);

    const dispatch = useAppDispatch();

    useEffect(() => {
        console.log("results changed");
        console.log(results);
    }, [results]);
    useEffect(() => {
        setLoading(users.loading);
    }, [users.loading]);

    useEffect(() => {
        if (!loading && justLoaded) {
            fetchAdminData();
            setJustLoaded(false);
        }
    }, [loading, justLoaded]);

    useEffect(() => {
        console.log("error:", users.error);
        if (users.error) {
            setIsError(true);
        }
        setErrorMessage(users.error);
    }, [users.error]);

    useEffect(() => {
        if (accessView !== accessLevel) {
            setAccessView(accessLevel);
        }
        fetchAdminData();
    }, [search, page, usersPerPage, accessLevel]);

    useEffect(() => {
        if (accessView !== accessLevel) {
            updateSearchParams({ accessLevel: accessView });
        }
    }, [accessView]);

    const fetchAdminData = () => {
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
            console.log("adding search parameters");
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
            const accessLevelParam: Array<"full" | "limited" | "view only"> =
                accessLevel === "all"
                    ? ["full", "limited", "view only"]
                    : [accessLevel as "full" | "limited" | "view only"];
            const params = {
                page: page,
                usersPerPage: usersPerPage,
                accessLevel: accessLevelParam,
                searchString: search ? search : undefined,
            };
            console.log("dispatching fetchAdmins");
            dispatch(fetchAdmins(params));
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
            dispatch(deleteUser({ user_id: deleteId, userRole: "admin" }));
        }
    };

    const handleChangeAccessLevel = async (
        username: string,
        oldAccessLevel: "full" | "limited" | "view only",
        newAccessLevel: "full" | "limited" | "view only"
    ) => {
        const token = localStorage.getItem("jwtToken");
        try {
            dispatch(changeAccessLevelOptimistic({ username, newAccessLevel }));
            await axios.put(
                `${process.env.REACT_APP_API_URL}/user/accessLevel`,
                { username, newAccessLevel },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            dispatch(rollbackAccessLevel({ username, oldAccessLevel }));
            if (error instanceof AxiosError) {
                console.log(error);
                setErrorMessage(error.message);
            } else {
                setErrorMessage(
                    "An unknown error occurred when updating access level"
                );
            }
            setIsError(true);
        }
    };

    const handleResetPassword = (user_id: number) => {
        dispatch(resetUserPassword({ user_id, userRole: "admin" }));
    };

    const handleAddAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // Access the form element
        const form = e.currentTarget;

        // Access individual form fields by their names or IDs
        const formData = new FormData(form);
        const username = formData.get("username") as string;
        const accessLevel = formData.get("accessLevel") as string;

        const token = localStorage.getItem("jwtToken");
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/auth/register`,
                { username, password: "default", role: "admin", accessLevel },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error("Error adding admin:", error.message);
                setErrorMessage(error.message);
                setIsError(true);
            } else {
                console.error("Error adding admin:", error);
                setErrorMessage("An unknown error occurred while adding admin");
                setIsError(true);
            }
        } finally {
            fetchAdminData();
        }

        setAddingUser(false);
    };

    return (
        <div className="admin-management">
            <div className="admin-manage-header">
                <h1>Admin Management</h1>
                <PeachButton
                    text="Add New Admin"
                    onClick={() => setAddingUser(true)}
                />
            </div>
            <div className="access-select">
                <InputLabel id={`view-label`}>View</InputLabel>
                <Select
                    fullWidth
                    labelId={"view-label"}
                    value={accessView || "all"}
                    variant="outlined"
                    id="view"
                    label="View"
                    onChange={(event) => setAccessView(event.target.value)}
                >
                    <MenuItem value={"all"}>All</MenuItem>
                    <MenuItem value={"full"}>Full Access</MenuItem>
                    <MenuItem value={"limited"}>Limited Access</MenuItem>
                    <MenuItem value={"view only"}>View Only</MenuItem>
                </Select>
            </div>
            <AdminList
                page={+page}
                results={results}
                numberOfResults={numberOfResults}
                updateSearchParams={updateSearchParams}
                handleUserDelete={handleUserDelete}
                handleChangeAccessLevel={handleChangeAccessLevel}
                handleResetPassword={handleResetPassword}
            />
            {showConfirm && (
                <BlankPopup>
                    <span>Delete user {deleteId}?</span>
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
            {addingUser && (
                <AddAdminPopup
                    handleAddAdmin={handleAddAdmin}
                    setAddingUser={setAddingUser}
                />
            )}
        </div>
    );
};
export default AdminManagement;
