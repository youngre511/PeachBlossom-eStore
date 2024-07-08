import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AVProductCatalog from "../../features/AVCatalog/AVProductCatalog";
import { AVFilters } from "../../features/AVCatalog/avCatalogTypes";
import {
    avFetchProducts,
    updateInventory,
} from "../../features/AVCatalog/avCatalogSlice";
import { arraysEqual } from "../../../common/utils/arraysEqual";
import { RootState } from "../../store/store.js";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import PeachButton from "../../../common/components/PeachButton";
import AddCircleOutlineSharpIcon from "@mui/icons-material/AddCircleOutlineSharp";
import { Button, SvgIcon } from "@mui/material";
import SearchField from "../../../common/components/Fields/SearchField";
import InventoryCatalog from "./InventoryCatalog";
import "./inventory-management.css";
import StatusPopup from "../../../common/components/StatusPopup";

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
    const subCategory = searchParams.get("sub_category");
    const page = searchParams.get("page") || "1";
    const tags = searchParams.get("tags")?.split(",") || null;
    const sort = searchParams.get("sort") || "name-ascend";
    const itemsPerPage = searchParams.get("itemsPerPage") || 24;

    const navigate = useNavigate();

    const memoParams = useMemo(() => {
        return {
            search,
            category,
            subCategory,
            tags,
            sort,
            page,
            itemsPerPage,
        };
    }, [search, category, subCategory, tags, sort, page, itemsPerPage]);

    useEffect(() => {
        const params = {
            search,
            category,
            subCategory,
            tags,
            sort,
            page,
            itemsPerPage,
        };
        //FetchLogic
        const currentFilters = Object.values(memoParams).map((value) =>
            value ? value.toString() : ""
        );
        const existingFilters = Object.values({
            ...avCatalog.filters,
        }).map((value) => (value ? value.toString() : ""));
        const filtersChanged = !arraysEqual(currentFilters, existingFilters);
        if (filtersChanged) {
            dispatch(avFetchProducts(params as AVFilters));
        }
    }, [search, category, subCategory, page, tags, sort, itemsPerPage]);

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
            subCategory,
            tags,
            sort,
            page,
            itemsPerPage,
        };
        console.log("Params:", params);
        dispatch(avFetchProducts(params as AVFilters));
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
            <h1>Inventory Management</h1>
            <div className="add-and-search">
                <div className="search-bar">
                    <SearchField
                        updateSearchParams={updateSearchParams}
                        sx={inputStyle}
                        inputSx={{ backgroundColor: "white" }}
                        options={avMenuData.searchOptions}
                    />
                </div>
                {Object.keys(pendingInventoryUpdates).length > 0 ? (
                    <Button variant="contained" onClick={handleSaveChanges}>
                        SAVE CHANGES
                    </Button>
                ) : (
                    <Button variant="contained" disabled>
                        SAVE CHANGES
                    </Button>
                )}
                <Button
                    variant="outlined"
                    onClick={() => setPendingInventoryUpdates({})}
                >
                    RESET
                </Button>
            </div>
            <InventoryCatalog
                page={+page}
                results={avCatalog.numberOfResults}
                updateSearchParams={updateSearchParams}
                pendingInventoryUpdates={pendingInventoryUpdates}
                setPendingInventoryUpdates={setPendingInventoryUpdates}
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
