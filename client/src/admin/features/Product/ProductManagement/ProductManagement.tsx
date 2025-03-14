import React, { useContext, useRef } from "react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AVProductCatalog from "./components/AVProductCatalog";
import { AVFilters } from "../avProductTypes";
import { avFetchProducts, updateProductStatus } from "../avProductSlice";
import { arraysEqual } from "../../../../common/utils/arraysEqual";
import { RootState } from "../../../store/store.js";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import GoldButton from "../../../../common/components/GoldButton";
import AddCircleOutlineSharpIcon from "@mui/icons-material/AddCircleOutlineSharp";
import FilterAltSharpIcon from "@mui/icons-material/FilterAltSharp";
import {
    Select,
    InputLabel,
    MenuItem,
    SelectChangeEvent,
    Icon,
} from "@mui/material";
import "./product-management.css";
import SearchField from "../../../../common/components/Fields/SearchField";
import { AVCategory } from "../../../store/AVMenuData/avMenuDataTypes";
import { AuthContext } from "../../../../common/contexts/authContext";
import { useNavigationContext } from "../../../../common/contexts/navContext";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";

const inputStyle = {
    "& .MuiInputBase-root.MuiOutlinedInput-root": {
        backgroundColor: "white",
    },
};

interface Props {}
const ProductManagement: React.FC<Props> = () => {
    const avMenuData = useAppSelector((state: RootState) => state.avMenuData);
    const avProduct = useAppSelector((state: RootState) => state.avProduct);
    const [categorySelection, setCategorySelection] =
        useState<AVCategory | null>(null);
    const dispatch = useAppDispatch();
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("sub_category");
    const page = searchParams.get("page") || "1";
    const tags = searchParams.get("tags")?.split(",") || null;
    const sort = searchParams.get("sort") || "name-ascend";
    const view = searchParams.get("view") || "active";
    const fromCategoryManage = searchParams.get("fcm") ? true : false;
    const itemsPerPage = searchParams.get("itemsPerPage") || 24;
    const [justLoaded, setJustLoaded] = useState<boolean>(true);
    const [loading, setLoading] = useState<boolean>(true);
    const authContext = useContext(AuthContext);
    const accessLevel = authContext?.user?.accessLevel;
    const { previousRoute } = useNavigationContext();
    const { width } = useWindowSizeContext();
    const [mobileFiltersExpanded, setMobileFiltersExpanded] =
        useState<boolean>(false);
    const productManagement = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        setLoading(avProduct.loading);
    }, [avProduct.loading]);

    useEffect(() => {
        if (!loading && justLoaded) {
            fetchData(true);
            setJustLoaded(false);
        }
    }, [loading, justLoaded]);

    useEffect(() => {
        fetchData(true);
    }, [search, category, subcategory, page, tags, sort, view, itemsPerPage]);

    const memoParams = useMemo(() => {
        return {
            search,
            category,
            subcategory,
            tags,
            sort,
            page,
            view,
            itemsPerPage,
        };
    }, [search, category, subcategory, tags, sort, page, view, itemsPerPage]);

    useEffect(() => {
        if (avMenuData.categories) {
            if (category && !categorySelection) {
                setCategorySelection(
                    avMenuData.categories.filter(
                        (cat) => cat.categoryName === category
                    )[0]
                );
            }
        }
    }, [avMenuData]);

    const fetchData = async (force = false) => {
        const changesNeeded: Record<string, string> = {};

        if (!searchParams.has("sort")) {
            changesNeeded.sort = "name-ascend";
        }
        if (!searchParams.has("page")) {
            changesNeeded.page = "1";
        }

        if (!searchParams.has("view")) {
            changesNeeded.view = "active";
        }

        if (!searchParams.has("itemsPerPage")) {
            changesNeeded.itemsPerPage = "24";
        }

        if (Object.keys(changesNeeded).length > 0) {
            updateSearchParams(changesNeeded);
        } else {
            const params = {
                search,
                category,
                subcategory,
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
                ...avProduct.filters,
            }).map((value) => (value ? value.toString() : ""));
            const filtersChanged = !arraysEqual(
                currentFilters,
                existingFilters
            );
            if (filtersChanged || force) {
                dispatch(
                    avFetchProducts({
                        filters: params as AVFilters,
                        force: force,
                    })
                );
            }
        }
    };

    const updateSearchParams = (newFilters: Record<string, string>): void => {
        const newParams = new URLSearchParams(searchParams);
        let changed = false;
        Object.keys(newFilters).forEach((key) => {
            const value = newFilters[key];
            if (value) {
                if (newParams.get(key) !== value) {
                    newParams.set(key, value as string);
                    changed = true;
                }
            } else if (newParams.has(key)) {
                newParams.delete(key);
                changed = true;
            }
        });
        if (changed) setSearchParams(newParams);
    };

    const handleCategorySelect = (event: SelectChangeEvent<string>): void => {
        const value = event.target.value === "all" ? null : event.target.value;
        setCategorySelection(
            avMenuData.categories.filter(
                (category) => category.categoryName === value
            )[0]
        );
        if (value) {
            updateSearchParams({ category: value });
        } else {
            updateSearchParams({ category: "", sub_category: "" });
        }
    };

    const handleSubcategorySelect = (
        event: SelectChangeEvent<string>
    ): void => {
        const value = event.target.value === "all" ? "" : event.target.value;
        updateSearchParams({ sub_category: value });
    };

    const handleProductDiscontinue = (productNo: string) => {
        if (accessLevel !== "view only") {
            dispatch(
                updateProductStatus({
                    productNos: [productNo],
                    newStatus: "discontinued",
                })
            );
        }
    };

    const handleProductActivate = (productNo: string) => {
        if (accessLevel !== "view only") {
            dispatch(
                updateProductStatus({
                    productNos: [productNo],
                    newStatus: "active",
                })
            );
        }
    };

    const discontinueSelected = (productNos: string[]) => {
        if (accessLevel !== "view only") {
            dispatch(
                updateProductStatus({
                    productNos: productNos,
                    newStatus: "discontinued",
                })
            );
        }
    };

    const activateSelected = (productNos: string[]) => {
        if (accessLevel !== "view only") {
            dispatch(
                updateProductStatus({
                    productNos: productNos,
                    newStatus: "active",
                })
            );
        }
    };

    return (
        <div className="product-management" ref={productManagement}>
            <div className="pm-header">
                <div className="header-and-add">
                    <h1>Product Management</h1>
                    {accessLevel !== "view only" && (
                        <div className="pm-desktop-add">
                            <GoldButton
                                text={`Add New Product`}
                                onClick={() => navigate("/products/add")}
                                width="150px"
                            />
                        </div>
                    )}
                    {fromCategoryManage && previousRoute && (
                        <GoldButton
                            text={`Back To Categories`}
                            onClick={() => navigate(previousRoute)}
                            width="150px"
                        />
                    )}
                </div>
                <div className="search-and-filters">
                    <div
                        className={
                            width && width >= 800
                                ? "pm-filters"
                                : "pm-filters-mobile"
                        }
                        style={
                            width && width < 800 && mobileFiltersExpanded
                                ? {
                                      height: "300px",
                                  }
                                : undefined
                        }
                    >
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
                                    updateSearchParams({
                                        view: event.target.value,
                                    })
                                }
                                sx={{ backgroundColor: "white" }}
                            >
                                <MenuItem value={"all"}>All</MenuItem>
                                <MenuItem value={"active"}>Active</MenuItem>
                                <MenuItem value={"discontinued"}>
                                    Discontinued
                                </MenuItem>
                            </Select>
                        </div>
                        <div className="category-select">
                            <InputLabel id={`category-label`}>
                                Category
                            </InputLabel>
                            <Select
                                fullWidth
                                labelId={"category-label"}
                                value={
                                    avMenuData.categories.length > 0
                                        ? category || "all"
                                        : "all"
                                }
                                variant="outlined"
                                id="category"
                                label="Category"
                                onChange={handleCategorySelect}
                                sx={{ backgroundColor: "white" }}
                            >
                                <MenuItem value={"all"}>All</MenuItem>
                                {avMenuData.categories.map(
                                    (category: AVCategory, index) => (
                                        <MenuItem
                                            value={category.categoryName}
                                            key={`category-${index}`}
                                        >
                                            {category.categoryName}
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
                                value={
                                    categorySelection
                                        ? subcategory || "all"
                                        : "all"
                                }
                                variant="outlined"
                                id="category"
                                disabled={
                                    categorySelection &&
                                    categorySelection.Subcategory.length > 0
                                        ? false
                                        : true
                                }
                                label="Subcategory"
                                onChange={handleSubcategorySelect}
                                sx={{ backgroundColor: "white" }}
                            >
                                <MenuItem value={"all"}>All</MenuItem>
                                {categorySelection &&
                                    categorySelection?.Subcategory.length > 0 &&
                                    categorySelection.Subcategory.map(
                                        (subcat, index) => (
                                            <MenuItem
                                                value={subcat.subcategoryName}
                                                key={`subcategory-${index}`}
                                            >
                                                {subcat.subcategoryName}
                                            </MenuItem>
                                        )
                                    )}
                            </Select>
                        </div>
                    </div>
                    <div
                        className="pm-mobile-buttons"
                        style={
                            accessLevel === "view only"
                                ? { display: "block" }
                                : undefined
                        }
                    >
                        {accessLevel !== "view only" && (
                            <button
                                onClick={() => navigate("/products/add")}
                                className="pm-mobile-add"
                            >
                                <Icon sx={{ marginRight: "10px" }}>
                                    <AddCircleOutlineSharpIcon />
                                </Icon>{" "}
                                Add New Product
                            </button>
                        )}
                        <button
                            className="pm-mobile-filter"
                            onClick={() =>
                                setMobileFiltersExpanded(!mobileFiltersExpanded)
                            }
                        >
                            <Icon sx={{ marginRight: "10px" }}>
                                <FilterAltSharpIcon />
                            </Icon>
                            Filters
                        </button>
                    </div>
                    <div className="search-bar-container">
                        <div className="search-bar">
                            <SearchField
                                updateSearchParams={updateSearchParams}
                                sx={inputStyle}
                                inputSx={{ backgroundColor: "white" }}
                                options={avMenuData.searchOptions}
                            />
                        </div>
                    </div>
                </div>
            </div>
            <AVProductCatalog
                page={+page}
                results={avProduct.numberOfResults}
                updateSearchParams={updateSearchParams}
                handleProductActivate={handleProductActivate}
                handleProductDiscontinue={handleProductDiscontinue}
                discontinueSelected={discontinueSelected}
                activateSelected={activateSelected}
            />
        </div>
    );
};
export default ProductManagement;
