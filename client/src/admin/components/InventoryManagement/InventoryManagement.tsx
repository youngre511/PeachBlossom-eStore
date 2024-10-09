import React, { useContext } from "react";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { AVFilters } from "../../features/AVCatalog/avCatalogTypes";
import {
    avFetchProducts,
    updateInventory,
} from "../../features/AVCatalog/avCatalogSlice";
import { arraysEqual } from "../../../common/utils/arraysEqual";
import { RootState } from "../../store/store.js";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";

import { Button } from "@mui/material";
import SearchField from "../../../common/components/Fields/SearchField";
import InventoryCatalog from "./InventoryCatalog";
import "./inventory-management.css";
import StatusPopup from "../../../common/components/StatusPopup";
import { AuthContext } from "../../../common/contexts/authContext";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

const inputStyle = {
    "& .MuiInputBase-root.MuiOutlinedInput-root": {
        backgroundColor: "white",
    },
};

interface Props {}
const InventoryManagement: React.FC<Props> = () => {
    const avMenuData = useAppSelector((state: RootState) => state.avMenuData);
    const avCatalog = useAppSelector((state: RootState) => state.avCatalog);
    const dispatch = useAppDispatch();
    const [pendingInventoryUpdates, setPendingInventoryUpdates] = useState<
        Record<string, number>
    >({});
    const [status, setStatus] = useState<"loading" | "success" | "failure">(
        "loading"
    );
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("sub_category");
    const page = searchParams.get("page") || "1";
    const tags = searchParams.get("tags")?.split(",") || null;
    const sort = searchParams.get("sort") || "name-ascend";
    const itemsPerPage = searchParams.get("itemsPerPage") || 24;
    const authContext = useContext(AuthContext);
    const accessLevel = authContext?.user?.accessLevel;
    const { width } = useWindowSizeContext();

    const memoParams = useMemo(() => {
        return {
            search,
            category,
            subcategory,
            tags,
            sort,
            page,
            itemsPerPage,
        };
    }, [search, category, subcategory, tags, sort, page, itemsPerPage]);

    useEffect(() => {
        const initialParams: Record<string, string> = {};

        if (!searchParams.get("sort")) {
            initialParams.sort = "name-ascend";
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
                category,
                subcategory,
                tags,
                sort,
                page,
                itemsPerPage,
                view: "active",
            };
            //FetchLogic
            const currentFilters = Object.values(memoParams).map((value) =>
                value ? value.toString() : ""
            );
            const existingFilters = Object.values({
                ...avCatalog.filters,
            }).map((value) => (value ? value.toString() : ""));
            const filtersChanged = !arraysEqual(
                currentFilters,
                existingFilters
            );
            if (filtersChanged) {
                dispatch(avFetchProducts({ filters: params as AVFilters }));
            }
        }
    }, [search, category, subcategory, page, tags, sort, itemsPerPage]);

    useEffect(() => {
        const initialParams: Record<string, string> = {};

        if (!searchParams.get("sort")) {
            initialParams.sort = "name-ascend";
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
        const params = {
            search,
            category,
            subcategory,
            tags,
            sort,
            page,
            itemsPerPage,
            view: "active",
        };
        console.log("Params:", params);
        dispatch(avFetchProducts({ filters: params as AVFilters }));
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

    // Save changes functions
    const handleSaveChanges = () => {
        if (Object.keys(pendingInventoryUpdates).length > 0) {
            setStatus("loading");
            setIsSaving(true);
            console.log("pending", pendingInventoryUpdates);
            dispatch(updateInventory(pendingInventoryUpdates));
        }
    };

    useEffect(() => {
        if (avCatalog.loading) {
            setStatus("loading");
        } else if (!avCatalog.loading && avCatalog.error) {
            setStatus("failure");
        } else {
            setStatus("success");
        }
    }, [avCatalog.loading, avCatalog.error]);

    const confirmStatus = () => {
        setPendingInventoryUpdates({});
        setIsSaving(false);
    };

    return (
        <div className="inventory-management">
            <div className="inv-header">
                <h1>Inventory Management</h1>
                <div className="inv-save-and-search">
                    <div className="inv-search-bar">
                        <SearchField
                            updateSearchParams={updateSearchParams}
                            sx={inputStyle}
                            inputSx={{ backgroundColor: "white" }}
                            options={avMenuData.searchOptions}
                        />
                    </div>
                    <div className="inv-buttons">
                        {Object.keys(pendingInventoryUpdates).length > 0 &&
                        accessLevel !== "view only" ? (
                            <Button
                                variant="contained"
                                onClick={handleSaveChanges}
                                sx={{
                                    height: "56px",
                                    width:
                                        width && width < 800
                                            ? "calc(50% - 5px)"
                                            : undefined,
                                }}
                            >
                                SAVE CHANGES
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                disabled
                                sx={{
                                    height: "56px",
                                    width:
                                        width && width < 800
                                            ? "calc(50% - 5px)"
                                            : undefined,
                                }}
                            >
                                SAVE CHANGES
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            onClick={() => setPendingInventoryUpdates({})}
                            sx={{
                                height: "56px",
                                marginLeft: "10px",
                                width:
                                    width && width < 800
                                        ? "calc(50% - 5px)"
                                        : undefined,
                            }}
                        >
                            RESET
                        </Button>
                    </div>
                </div>
            </div>
            <div className="inventory-note">
                Note: It will take up to three minutes for changes in inventory
                to propagate to the customer-facing catalog.
            </div>
            <InventoryCatalog
                page={+page}
                results={avCatalog.numberOfResults}
                updateSearchParams={updateSearchParams}
                pendingInventoryUpdates={pendingInventoryUpdates}
                setPendingInventoryUpdates={setPendingInventoryUpdates}
                editable={accessLevel !== "view only"}
            />
            {isSaving && (
                <StatusPopup
                    status={status}
                    loadingMessage="Saving changes..."
                    successMessage="Inventory stock levels updated."
                    failureMessage={`Oops! Something went wrong: ${avCatalog.error}`}
                    actionFunction={confirmStatus}
                />
            )}
        </div>
    );
};
export default InventoryManagement;
