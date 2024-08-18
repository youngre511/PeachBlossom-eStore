import React, { useRef, useState } from "react";
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
import ItemsPerPageSelector from "./ItemsPerPageSelector";
import { Button, IconButton } from "@mui/material";
import FilterAltSharpIcon from "@mui/icons-material/FilterAltSharp";
import SwapVertSharpIcon from "@mui/icons-material/SwapVertSharp";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import useWindowDimensions from "../../../common/hooks/useWindowDimensions";

const Shop = () => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector((state: RootState) => state.catalog);
    const itemsPerPage = useAppSelector(
        (state: RootState) => state.userPreferences.itemsPerPage
    );
    const { width } = useWindowDimensions();
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
    const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);
    const [drawerInitialized, setDrawerInitialized] = useState<boolean>(false);
    const filterAnimationRef = useRef<GSAPTimeline | null>(null);
    const shop = useRef<HTMLDivElement>(null);
    const { contextSafe } = useGSAP({ scope: shop });

    useEffect(
        // Set up drawer animation
        contextSafe(() => {
            // Initialize animation on resize only if width is under 1155 (and therefore .filter-options-drawer is rendered) and if it has not already been initialized.
            if (width && width < 1155 && !drawerInitialized) {
                filterAnimationRef.current = gsap
                    .timeline({
                        paused: true,
                        onStart: () => console.log("running"),
                    })
                    .set(".filter-options-drawer", { display: "block" })
                    .to(".filter-options-drawer", { duration: 0.4, x: 0 });

                if (filterDrawerOpen) {
                    filterAnimationRef.current?.seek(
                        filterAnimationRef.current.duration()
                    );
                }
                // Change initialization tracker state
                setDrawerInitialized(true);
            }
        }),
        [width]
    );

    const handleFilterDrawerOpen = () => {
        // Activate
        if (filterAnimationRef.current) {
            if (!filterDrawerOpen) {
                filterAnimationRef.current.play();
                setFilterDrawerOpen(true);
            }
        }
    };

    const handleFilterDrawerClose = () => {
        if (filterAnimationRef.current) {
            if (filterDrawerOpen) {
                filterAnimationRef.current.reverse();
                setFilterDrawerOpen(false);
            }
        }
    };

    useEffect(() => {
        // If window is resized above 1154 and drawer is open, set state tracking open state and the state tracking initialization to false and clear current animation.
        if (width && width >= 1155) {
            if (filterDrawerOpen) {
                setFilterDrawerOpen(false);
            }
            filterAnimationRef.current?.seek(0).pause();
            filterAnimationRef.current = null;
            setDrawerInitialized(false);
        }
    }, [width, filterDrawerOpen]);

    //Memoize params to prevent unnecessary re-renders
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

    const fetchData = async () => {
        //Establish params object and add any of the required params that are missing
        const initialParams: Record<string, string> = {};
        if (!searchParams.get("sort")) {
            initialParams.sort = "name-ascend";
        }
        if (!searchParams.get("page")) {
            initialParams.page = "1";
        }

        // If there were any missing params/if params object contains any keys, then add those params to the search params
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
            //If there were no missing params, dispatch a request to fetch products based on the existing filters
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

            // Before dispatching request, check that params have changed
            const filtersChanged = !arraysEqual(
                currentFilters,
                existingFilters
            );

            if (filtersChanged) {
                dispatch(fetchProducts(params as Filters));
            }
        }
    };

    useEffect(() => {
        fetchData();
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
        searchParams,
        setSearchParams,
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
        <div className="shop-container" ref={shop}>
            <FilterOptions
                updateSearchParams={updateSearchParams}
                addSubCategory={addSubCategory}
                addSubCategoryAndCategory={addSubCategoryAndCategory}
                addCategory={addCategory}
                handleFilterDrawerClose={handleFilterDrawerClose}
            />
            <div className="product-display">
                <div className="shop-header">
                    {search && (
                        <h1 className="shop-heading">
                            {catalog.numberOfResults} search result
                            {catalog.numberOfResults !== 1 && (
                                <span>s</span>
                            )}{" "}
                            for "{search}"
                        </h1>
                    )}
                    {!subCategory && !search && (
                        <h1 className="shop-heading">
                            {category ? category : "Shop All"}
                        </h1>
                    )}
                    {subCategory && !search && (
                        <h1 className="shop-heading">
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
                        <ItemsPerPageSelector />
                        <button
                            className="shop-filter-button"
                            onClick={() => handleFilterDrawerOpen()}
                        >
                            Filter
                            <FilterAltSharpIcon className="shop-filter-icon" />
                        </button>
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
