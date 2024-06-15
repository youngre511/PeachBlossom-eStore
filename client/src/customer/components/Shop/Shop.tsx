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
    const sortMethod = searchParams.get("sort") || "name-ascend";
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
            sortMethod,
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
        sortMethod,
        page,
        itemsPerPage,
    ]);

    useEffect(() => {
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
            sortMethod,
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
        const filtersChanged = !arraysEqual(currentFilters, existingFilters);
        if (filtersChanged) {
            dispatch(fetchProducts(params as Filters));
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
        sortMethod,
        material,
        itemsPerPage,
    ]);

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

    return (
        <div className="shop-container">
            <FilterOptions updateSearchParams={updateSearchParams} />
            <div className="product-display">
                <div className="shop-header">
                    <div className="per-page-selector">
                        <p>Items Per Page</p>
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
                    <h1>{category ? category : "Shop All"}</h1>
                    <p>number of results: {catalog.numberOfResults}</p>
                    <SortMethodSelector
                        sortMethod={sortMethod}
                        updateSearchParams={updateSearchParams}
                    />
                </div>
                <ProductCatalog />
            </div>
        </div>
    );
};
export default Shop;
