import React from "react";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import "./shop.css";

import { RootState } from "../../store/customerStore";
import { setItemsPerPage } from "../../features/UserPreferences/userPreferencesSlice";
import { arraysEqual } from "../../../common/utils/arraysEqual";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { fetchProducts } from "../../features/ProductCatalog/catalogSlice";
import ProductCatalog from "../../features/ProductCatalog/ProductCatalog";
import FilterOptions from "../../features/FilterOptions/FilterOptions";
import SortMethodSelector from "../../features/SortMethodSelector/SortMethodSelector";
import { Filters } from "../../features/ProductCatalog/CatalogTypes";

const Shop = () => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector((state: RootState) => state.catalog);
    const itemsPerPage = useAppSelector(
        (state: RootState) => state.userPreferences.itemsPerPage
    );

    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const subCategory = searchParams.get("sub_category");
    const page = searchParams.get("page") || "1";
    const color = searchParams.get("color")?.split(",") || null;
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const minWidth = searchParams.get("min_width");
    const maxWidth = searchParams.get("max_width");
    const minHeight = searchParams.get("min_Height");
    const maxHeight = searchParams.get("max_Height");
    const minDepth = searchParams.get("min_Depth");
    const maxDepth = searchParams.get("max_Depth");
    const tags = searchParams.get("tags")?.split(",") || null;
    const sort = searchParams.get("sort") || "name-ascend";
    const material = searchParams.get("material")?.split(",") || null;

    const memoParams = useMemo(() => {
        return {
            search,
            category,
            subCategory,
            color,
            minPrice,
            maxPrice,
            minWidth,
            maxWidth,
            minHeight,
            maxHeight,
            minDepth,
            maxDepth,
            tags,
            material,
            sort,
            page,
            itemsPerPage,
        };
    }, [
        search,
        category,
        subCategory,
        color,
        minPrice,
        maxPrice,
        minWidth,
        maxWidth,
        minHeight,
        maxHeight,
        minDepth,
        maxDepth,
        tags,
        material,
        sort,
        page,
        itemsPerPage,
    ]);

    useEffect(() => {
        const initialParams: Record<string, string> = {};

        if (!searchParams.get("sort")) {
            initialParams.sort = "name-ascend";
        }
        if (!searchParams.get("page")) {
            initialParams.page = "1";
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
                subCategory,
                color,
                minPrice,
                maxPrice,
                minWidth,
                maxWidth,
                minHeight,
                maxHeight,
                minDepth,
                maxDepth,
                tags,
                material,
                sort,
                page,
            };
            //FetchLogic
            const currentFilters = Object.values(memoParams).map((value) =>
                value ? value.toString() : ""
            );
            const existingFilters = Object.values({
                ...catalog.filters,
                itemsPerPage: itemsPerPage,
            }).map((value) => (value ? value.toString() : ""));
            const filtersChanged = !arraysEqual(
                currentFilters,
                existingFilters
            );
            if (filtersChanged) {
                dispatch(fetchProducts(params as Filters));
            }
        }
    }, [
        search,
        category,
        subCategory,
        page,
        color,
        minPrice,
        maxPrice,
        minWidth,
        maxWidth,
        minDepth,
        maxDepth,
        minHeight,
        maxHeight,
        tags,
        sort,
        material,
        itemsPerPage,
    ]);

    useEffect(() => {
        const initialParams: Record<string, string> = {};

        if (!searchParams.get("sort")) {
            initialParams.sort = "name-ascend";
        }
        if (!searchParams.get("page")) {
            initialParams.page = "1";
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
            color,
            minPrice,
            maxPrice,
            minWidth,
            maxWidth,
            minHeight,
            maxHeight,
            minDepth,
            maxDepth,
            tags,
            material,
            sort,
            page,
        };
        console.log(params);
        dispatch(fetchProducts(params as Filters));
    }, [searchParams, setSearchParams]);

    const handleItemsPerPageChange = (newItemsPerPage: 24 | 48 | 96) => {
        dispatch(setItemsPerPage(newItemsPerPage));
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

    const removeSubCategory = (): void => {
        searchParams.delete("sub_category");
        setSearchParams(searchParams);
    };

    const addSubCategoryAndCategory = (
        subCategory: string,
        category: string
    ): void => {
        searchParams.set("sub_category", subCategory);
        searchParams.set("category", category);
        setSearchParams(searchParams);
    };

    const addSubCategory = (subCategory: string): void => {
        searchParams.set("sub_category", subCategory);
        setSearchParams(searchParams);
    };

    const addCategory = (category: string): void => {
        searchParams.set("category", category);
        setSearchParams(searchParams);
    };

    return (
        <div className="shop-container">
            <FilterOptions
                updateSearchParams={updateSearchParams}
                addSubCategory={addSubCategory}
                addSubCategoryAndCategory={addSubCategoryAndCategory}
                addCategory={addCategory}
            />
            <div className="product-display">
                <div className="shop-header">
                    {!subCategory && (
                        <h1>{category ? category : "Shop All"}</h1>
                    )}
                    {subCategory && (
                        <h1>
                            <span
                                className="back-to-category"
                                onClick={removeSubCategory}
                            >
                                {category}
                            </span>{" "}
                            / {subCategory}
                        </h1>
                    )}
                    <div className="sort-and-ipp">
                        <SortMethodSelector
                            sortMethod={sort}
                            updateSearchParams={updateSearchParams}
                        />
                        <div className="per-page-selector">
                            <p>Items per page</p>
                            <button
                                type="button"
                                onClick={() => handleItemsPerPageChange(24)}
                            >
                                24
                            </button>
                            <button
                                type="button"
                                onClick={() => handleItemsPerPageChange(48)}
                            >
                                48
                            </button>
                            <button
                                type="button"
                                onClick={() => handleItemsPerPageChange(96)}
                            >
                                96
                            </button>
                        </div>
                    </div>
                </div>
                <ProductCatalog
                    page={+page}
                    results={catalog.numberOfResults}
                />
            </div>
        </div>
    );
};
export default Shop;
