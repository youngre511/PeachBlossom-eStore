import React, { useRef, useState } from "react";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import "./shop.css";

import { RootState } from "../../store/customerStore";
import { arraysEqual } from "../../../common/utils/arraysEqual";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { fetchProducts } from "./catalogSlice";
import ProductCatalog from "./components/ProductCatalog";
import FilterOptions from "../../features/FilterOptions/FilterOptions";
import SortMethodSelector from "./components/SortMethodSelector";
import { Filters } from "./CatalogTypes";
import ItemsPerPageSelector from "./components/ItemsPerPageSelector";
import FilterAltSharpIcon from "@mui/icons-material/FilterAltSharp";
import SwapVertSharpIcon from "@mui/icons-material/SwapVertSharp";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";
import PageSelector from "../../components/PageSelector/PageSelector";

const Shop = () => {
    const dispatch = useAppDispatch();
    const catalog = useAppSelector((state: RootState) => state.catalog);
    const itemsPerPage = useAppSelector(
        (state: RootState) => state.userData.preferences.itemsPerPage
    );
    const { width } = useWindowSizeContext();
    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const subcategory = searchParams.get("sub_category");
    const page = searchParams.get("page") || "1";
    const color = searchParams.get("color") || null;
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const minWidth = searchParams.get("minWidth");
    const maxWidth = searchParams.get("maxWidth");
    const minHeight = searchParams.get("minHeight");
    const maxHeight = searchParams.get("maxHeight");
    const minDepth = searchParams.get("minDepth");
    const maxDepth = searchParams.get("maxDepth");
    const tags = searchParams.get("tags") || null;
    const sort = searchParams.get("sort") || "name-ascend";
    const material = searchParams.get("material") || null;
    const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);
    const [drawerInitialized, setDrawerInitialized] = useState<boolean>(false);
    const filterAnimationRef = useRef<GSAPTimeline | null>(null);
    const shop = useRef<HTMLDivElement>(null);
    const [currentWidth, setCurrentWidth] = useState<number | null>(null);
    const { contextSafe } = useGSAP({ scope: shop });
    const [sortMenuVisible, setSortMenuVisible] = useState<boolean>(false);
    const selectedBtnStyle = {
        backgroundColor: "var(--deep-peach)",
        color: "white",
    };
    const [isInitialLoad, setIsInitialLoad] = useState<boolean>(true);

    useEffect(
        // Set up drawer animation
        contextSafe(() => {
            // Initialize animation on resize only if width is under 1155 (and therefore .filter-options-drawer is rendered) and if it has not already been initialized.
            if (width && width < 1155 && !drawerInitialized) {
                filterAnimationRef.current = gsap
                    .timeline({
                        paused: true,
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

            // Separately, check to see, on resize, if the resize has crossed 550px one way or another. If so, and if itemsPerPage is not 24, run fetchData(), which has logic overriding user-setting for itemsPerPage on mobile (< 550px).
            if (
                itemsPerPage !== 24 &&
                currentWidth &&
                width &&
                ((width >= 550 && currentWidth < 550) ||
                    (width < 550 && currentWidth >= 550))
            ) {
                fetchData(true);
            }
            //Set the current width so that resized widths can be compared to it.
            setCurrentWidth(width);
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
            subcategory,
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
        subcategory,
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

    const fetchData = async (force: boolean = false) => {
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
            const noArrayParams = {
                search,
                category,
                subcategory,
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
                itemsPerPage: width && width >= 550 ? itemsPerPage : 24,
            }).map((value) => (value ? value.toString() : ""));

            // Before dispatching request, check that params have changed
            const filtersChanged = !arraysEqual(
                currentFilters,
                existingFilters
            );
            // isInitialLoad ensures that fetchProducts runs on page load, when data has not been retrieved but slice may be storing identical filter data from previous loads.
            if (filtersChanged || isInitialLoad || force) {
                if (isInitialLoad) {
                    setIsInitialLoad(false);
                }
                const mobile = width && width < 550 ? true : false;
                const params = {
                    ...noArrayParams,
                    color: noArrayParams.color?.split(","),
                    material: noArrayParams.material?.split(","),
                    tags: noArrayParams.tags?.split(","),
                };
                dispatch(
                    fetchProducts({ filters: params as Filters, force, mobile })
                );
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, [
        search,
        category,
        subcategory,
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
        searchParams.toString(),
    ]);

    // If items per page changes, check whether current page is page one. If it is, force fetchData. If it isn't, set searchParams to page 1, triggering fetchData.
    useEffect(() => {
        if (page === "1") {
            fetchData(true);
        } else {
            setSearchParams((prevParams) => {
                const newParams = new URLSearchParams(prevParams);
                newParams.set(page, "1");
                return newParams;
            });
        }
    }, [itemsPerPage]);

    const updateSearchParams = (newFilters: Record<string, string>): void => {
        setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);
            Object.keys(newFilters).forEach((key) => {
                const value = newFilters[key];
                if (value) {
                    newParams.set(key, value as string);
                } else {
                    newParams.delete(key);
                }
            });
            return newParams;
        });
    };

    const changeSortOrder = (
        newOrder:
            | "name-ascend"
            | "name-descend"
            | "price-ascend"
            | "price-descend"
    ) => {
        updateSearchParams({ sort: newOrder, page: "1" });
    };

    const removeSubcategory = (): void => {
        setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);
            newParams.delete("sub_category");
            newParams.set("page", "1");
            return newParams;
        });
    };

    const removeCategory = (): void => {
        setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);
            newParams.delete("category");
            newParams.set("page", "1");
            return newParams;
        });
    };

    const addSubcategoryAndCategory = (
        subcategory: string,
        category: string
    ): void => {
        setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);
            newParams.set("sub_category", subcategory);
            newParams.set("category", category);
            newParams.set("page", "1");
            return newParams;
        });
    };

    const addSubcategory = (subcategory: string): void => {
        setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);
            newParams.set("sub_category", subcategory);
            newParams.set("page", "1");
            return newParams;
        });
    };

    const addCategory = (category: string): void => {
        setSearchParams((prevParams) => {
            const newParams = new URLSearchParams(prevParams);
            newParams.set("category", category);
            newParams.set("page", "1");
            return newParams;
        });
    };

    return (
        <div className="shop-container" ref={shop}>
            <FilterOptions
                updateSearchParams={updateSearchParams}
                addSubcategory={addSubcategory}
                addSubcategoryAndCategory={addSubcategoryAndCategory}
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
                    {!subcategory && !search && (
                        <h1 className="shop-heading">
                            {category ? (
                                <React.Fragment>
                                    <span
                                        className="back-to-category"
                                        onClick={removeCategory}
                                        style={{ cursor: "pointer" }}
                                    >
                                        Shop All
                                    </span>{" "}
                                    / {category}
                                </React.Fragment>
                            ) : (
                                "Shop All"
                            )}
                        </h1>
                    )}
                    {subcategory && !search && (
                        <h1 className="shop-heading">
                            <span
                                className="back-to-category"
                                onClick={removeSubcategory}
                                style={{ cursor: "pointer" }}
                            >
                                {category}
                            </span>{" "}
                            / {subcategory}
                        </h1>
                    )}
                    <div className="sort-and-ipp">
                        {width && width >= 500 && (
                            <React.Fragment>
                                <SortMethodSelector
                                    sortMethod={sort}
                                    updateSearchParams={updateSearchParams}
                                />
                                <ItemsPerPageSelector />
                            </React.Fragment>
                        )}
                        {width && width < 500 && (
                            <React.Fragment>
                                <button
                                    className="shop-sort-button"
                                    onClick={() =>
                                        setSortMenuVisible(!sortMenuVisible)
                                    }
                                >
                                    Sort
                                    <SwapVertSharpIcon
                                        className="shop-sort-icon"
                                        // fontSize="large"
                                    />
                                </button>
                                <div
                                    className="mobile-sort-menu"
                                    style={{
                                        height: sortMenuVisible ? "240px" : 0,
                                    }}
                                >
                                    <button
                                        className="sort-buttons"
                                        style={
                                            sort === "name-ascend"
                                                ? selectedBtnStyle
                                                : undefined
                                        }
                                        onClick={() => {
                                            changeSortOrder("name-ascend");
                                            setSortMenuVisible(false);
                                        }}
                                    >
                                        A&ndash;Z
                                    </button>
                                    <button
                                        className="sort-buttons"
                                        style={
                                            sort === "name-descend"
                                                ? selectedBtnStyle
                                                : undefined
                                        }
                                        onClick={() => {
                                            changeSortOrder("name-descend");
                                            setSortMenuVisible(false);
                                        }}
                                    >
                                        Z&ndash;A
                                    </button>
                                    <button
                                        className="sort-buttons"
                                        style={
                                            sort === "price-ascend"
                                                ? selectedBtnStyle
                                                : undefined
                                        }
                                        onClick={() => {
                                            changeSortOrder("price-ascend");
                                            setSortMenuVisible(false);
                                        }}
                                    >
                                        $&ndash;$$$
                                    </button>
                                    <button
                                        className="sort-buttons"
                                        style={
                                            sort === "price-descend"
                                                ? selectedBtnStyle
                                                : undefined
                                        }
                                        onClick={() => {
                                            changeSortOrder("price-descend");
                                            setSortMenuVisible(false);
                                        }}
                                    >
                                        $$$&ndash;$
                                    </button>
                                </div>
                            </React.Fragment>
                        )}
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
                <div className="pagination">
                    <PageSelector
                        itemsPerPage={+itemsPerPage}
                        numberOfResults={catalog.numberOfResults}
                        currentPage={+page}
                        updateSearchParams={updateSearchParams}
                    />
                </div>
            </div>
        </div>
    );
};
export default Shop;
