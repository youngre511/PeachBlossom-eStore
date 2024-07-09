import React from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AVProductCatalog from "../../features/AVCatalog/AVProductCatalog";
import { AVFilters } from "../../features/AVCatalog/avCatalogTypes";
import { avFetchProducts } from "../../features/AVCatalog/avCatalogSlice";
import { arraysEqual } from "../../../common/utils/arraysEqual";
import { RootState } from "../../store/store.js";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import PeachButton from "../../../common/components/PeachButton";
import AddCircleOutlineSharpIcon from "@mui/icons-material/AddCircleOutlineSharp";
import {
    Select,
    SvgIcon,
    InputLabel,
    MenuItem,
    SelectChangeEvent,
} from "@mui/material";
import "./product-management.css";
import SearchField from "../../../common/components/Fields/SearchField";
import { AVCategory } from "../../features/AVMenuData/avMenuDataTypes";

const inputStyle = {
    "& .MuiInputBase-root.MuiOutlinedInput-root": {
        backgroundColor: "white",
    },
};

interface Props {}
const ProductManagement: React.FC<Props> = () => {
    const avMenuData = useAppSelector((state: RootState) => state.avMenuData);
    const avCatalog = useAppSelector((state: RootState) => state.avCatalog);
    const [categorySelection, setCategorySelection] =
        useState<AVCategory | null>(null);
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const subCategory = searchParams.get("sub_category");
    const page = searchParams.get("page") || "1";
    const tags = searchParams.get("tags")?.split(",") || null;
    const sort = searchParams.get("sort") || "name-ascend";
    const view = searchParams.get("view") || "Active";
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
            view,
            itemsPerPage,
        };
    }, [search, category, subCategory, tags, sort, page, view, itemsPerPage]);

    useEffect(() => {
        const params = {
            search,
            category,
            subCategory,
            tags,
            sort,
            page,
            view,
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
    }, [search, category, subCategory, page, tags, sort, view, itemsPerPage]);

    useEffect(() => {
        const initialParams: Record<string, string> = {};

        if (!searchParams.get("sort")) {
            initialParams.sort = "name-ascend";
        }
        if (!searchParams.get("page")) {
            initialParams.page = "1";
        }

        if (!searchParams.get("view")) {
            initialParams.view = "active";
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
            view,
            itemsPerPage,
        };
        dispatch(avFetchProducts(params as AVFilters));
    }, [searchParams, setSearchParams]);

    const updateSearchParams = (newFilters: Record<string, string>): void => {
        Object.keys(newFilters).forEach((key) => {
            const value = newFilters[key];
            if (value) {
                searchParams.set(key, value as string);
            } else {
                console.log("deleting");
                searchParams.delete(key);
            }
        });
        setSearchParams(searchParams);
    };

    const handleCategorySelect = (event: SelectChangeEvent<string>): void => {
        const value = event.target.value === "All" ? null : event.target.value;
        setCategorySelection(
            avMenuData.categories.filter(
                (category) => category.name === value
            )[0]
        );
        console.log("value", event.target.value, value);
        if (value) {
            updateSearchParams({ category: value });
        } else {
            searchParams.delete("category");
            searchParams.delete("subCategory");
            setSearchParams(searchParams);
        }
    };

    const handleSubcategorySelect = (
        event: SelectChangeEvent<string>
    ): void => {
        const value =
            event.target.value === "All" ? "null" : event.target.value;
        if (value) {
            updateSearchParams({ subCategory: value });
        } else {
            searchParams.delete("subCategory");
            setSearchParams(searchParams);
        }
    };

    const handleViewSelect = (event: SelectChangeEvent<string>): void => {
        const value =
            event.target.value === "All" ? "null" : event.target.value;
        if (value) {
            updateSearchParams({ subCategory: value });
        } else {
            searchParams.delete("subCategory");
            setSearchParams(searchParams);
        }
    };

    return (
        <div className="product-management">
            <div className="header-and-add">
                <h1>Product Management</h1>
                <PeachButton
                    text={`Add New Product`}
                    onClick={() => navigate("/products/add")}
                    width="150px"
                />
            </div>
            <div className="search-and-filters">
                <div className="pm-filters">
                    <div className="view-select">
                        <InputLabel id={`view-label`}>View</InputLabel>
                        <Select
                            fullWidth
                            labelId={"view-label"}
                            value={view || "active"}
                            variant="outlined"
                            id="view"
                            label="View"
                            onChange={(event) =>
                                updateSearchParams({ view: event.target.value })
                            }
                        >
                            <MenuItem value={"all"}>All</MenuItem>
                            <MenuItem value={"active"}>Active</MenuItem>
                            <MenuItem value={"discontinued"}>
                                Discontinued
                            </MenuItem>
                        </Select>
                    </div>
                    <div className="category-select" style={{ width: "200px" }}>
                        <InputLabel id={`category-label`}>Category</InputLabel>
                        <Select
                            fullWidth
                            labelId={"category-label"}
                            value={category || "All"}
                            variant="outlined"
                            id="category"
                            label="Category"
                            onChange={handleCategorySelect}
                        >
                            <MenuItem value={"All"}>All</MenuItem>
                            {avMenuData.categories.map(
                                (category: AVCategory, index) => (
                                    <MenuItem
                                        value={category.name}
                                        key={`category-${index}`}
                                    >
                                        {category.name}
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </div>
                    <div className="subcategory-select">
                        <InputLabel id={`subcategory-label`}>
                            Subcategory
                        </InputLabel>
                        <Select
                            fullWidth
                            labelId={"subcategory-label"}
                            value={subCategory || "All"}
                            variant="outlined"
                            id="category"
                            disabled={
                                categorySelection &&
                                categorySelection.subCategories.length > 0
                                    ? false
                                    : true
                            }
                            label="Subcategory"
                            onChange={handleSubcategorySelect}
                        >
                            <MenuItem value={"All"}>All</MenuItem>
                            {categorySelection &&
                                categorySelection?.subCategories.length > 0 &&
                                categorySelection.subCategories.map(
                                    (subCategory: string, index) => (
                                        <MenuItem
                                            value={subCategory}
                                            key={`subcategory-${index}`}
                                        >
                                            {subCategory}
                                        </MenuItem>
                                    )
                                )}
                        </Select>
                    </div>
                </div>

                <div className="search-bar">
                    <SearchField
                        updateSearchParams={updateSearchParams}
                        sx={inputStyle}
                        inputSx={{ backgroundColor: "white" }}
                        options={avMenuData.searchOptions}
                    />
                </div>
            </div>
            <AVProductCatalog
                page={+page}
                results={avCatalog.numberOfResults}
                updateSearchParams={updateSearchParams}
            />
        </div>
    );
};
export default ProductManagement;
