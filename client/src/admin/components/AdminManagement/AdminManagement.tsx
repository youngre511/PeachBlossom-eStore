import React from "react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios, { AxiosError } from "axios";
import "./admin-management.css";
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
import { Button, Icon, InputLabel, MenuItem, Select } from "@mui/material";
import GoldButton from "../../../common/components/GoldButton";
import BlankPopup from "../../../common/components/BlankPopup";
import AddAdminPopup from "./AddAdminPopup";
import AdminList from "./AdminList";
import AddCircleOutlineSharpIcon from "@mui/icons-material/AddCircleOutlineSharp";
import VisibilitySharpIcon from "@mui/icons-material/VisibilitySharp";
import { axiosLogAndSetState } from "../../../common/utils/axiosLogAndSetState";

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

const AdminManagement: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search");
    const page = searchParams.get("page") || "1";
    const usersPerPage = searchParams.get("usersPerPage") || "24";
    const accessLevel = searchParams.get("accessLevel") || "all";
    const users = useAppSelector((state: RootState) => state.users);
    const numberOfResults = users.numberOfAdmins;
    const results = users.admins;
    const [loading, setLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [showConfirm, setShowConfirm] = useState<boolean>(false);
    const [justLoaded, setJustLoaded] = useState<boolean>(true);
    const [accessView, setAccessView] = useState<string>("all");
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [addingUser, setAddingUser] = useState<boolean>(false);
    const [mobileViewsExpanded, setMobileViewsExpanded] =
        useState<boolean>(false);
    const navigate = useNavigate();

    const dispatch = useAppDispatch();

    useEffect(() => {
        setLoading(users.loading);
    }, [users.loading]);

    // Fetch data on page load then set justLoaded state to false to prevent future automatic fetches.
    useEffect(() => {
        if (!loading && justLoaded) {
            fetchAdminData();
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
        if (accessView !== accessLevel) {
            setAccessView(accessLevel);
        }
        fetchAdminData();
    }, [searchParams, search, page, usersPerPage, accessLevel]);

    useEffect(() => {
        if (accessView !== accessLevel) {
            updateSearchParams({ accessLevel: accessView });
        }
    }, [accessView]);

    // Construct formatted params and dispatch fetch request to slice.
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
                `${import.meta.env.VITE_API_URL}/user/accessLevel`,
                { username, newAccessLevel },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            dispatch(rollbackAccessLevel({ username, oldAccessLevel }));
            axiosLogAndSetState(
                error,
                setErrorMessage,
                "updating access level"
            );
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
                `${import.meta.env.VITE_API_URL}/auth/register`,
                {
                    username,
                    password: "default",
                    role: "admin",
                    accessLevel,
                    defaultPassword: true,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        } catch (error) {
            axiosLogAndSetState(error, setErrorMessage, "adding admin");
            setIsError(true);
        } finally {
            fetchAdminData();
        }

        setAddingUser(false);
    };

    return (
        <div className="admin-management">
            <div className="admin-manage-header">
                <h1>Admin Management</h1>
                <div className="add-admin-btn">
                    <GoldButton
                        text="Add New Admin"
                        onClick={() => setAddingUser(true)}
                        width={"150px"}
                    />
                </div>
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
                    sx={inputStyle}
                >
                    <MenuItem value={"all"}>All</MenuItem>
                    <MenuItem value={"full"}>Full Access</MenuItem>
                    <MenuItem value={"limited"}>Limited Access</MenuItem>
                    <MenuItem value={"view only"}>View Only</MenuItem>
                </Select>
            </div>
            <div className="am-mobile-buttons">
                <button
                    onClick={() => navigate("/products/add")}
                    className="am-mobile-add"
                >
                    <Icon sx={{ marginRight: "10px" }}>
                        <AddCircleOutlineSharpIcon />
                    </Icon>{" "}
                    Add New Admin
                </button>
                <button
                    className="am-mobile-views"
                    onClick={() => setMobileViewsExpanded(!mobileViewsExpanded)}
                >
                    <Icon sx={{ marginRight: "10px" }}>
                        <VisibilitySharpIcon />
                    </Icon>
                    Views
                </button>
                <div
                    className="mobile-view-menu"
                    style={
                        mobileViewsExpanded ? { height: "256px" } : undefined
                    }
                >
                    <button
                        style={
                            accessView === "all"
                                ? { backgroundColor: "var(--peach-blush)" }
                                : undefined
                        }
                        onClick={() => setAccessView("all")}
                    >
                        All
                    </button>
                    <button
                        style={
                            accessView === "full"
                                ? { backgroundColor: "var(--peach-blush)" }
                                : undefined
                        }
                        onClick={() => setAccessView("full")}
                    >
                        Full
                    </button>
                    <button
                        style={
                            accessView === "limited"
                                ? { backgroundColor: "var(--peach-blush)" }
                                : undefined
                        }
                        onClick={() => setAccessView("limited")}
                    >
                        Limited
                    </button>
                    <button
                        style={
                            accessView === "view only"
                                ? { backgroundColor: "var(--peach-blush)" }
                                : undefined
                        }
                        onClick={() => setAccessView("view only")}
                    >
                        View Only
                    </button>
                </div>
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
