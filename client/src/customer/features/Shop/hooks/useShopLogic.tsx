import { useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { fetchProducts } from "../catalogSlice";
import { arraysEqual } from "../../../../common/utils/arraysEqual";
import { Filters } from "../CatalogTypes";
import { RootState } from "../../../store/customerStore";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";

interface ShopLogic {
    search: string | null;
    category: string | null;
    subcategory: string | null;
    page: string;
    sort: string;
    fetchData: (force?: boolean) => void;
    updateSearchParams: (newFilters: Record<string, string | null>) => void;
}

function useShopLogic(): ShopLogic {
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

    const [isInitialLoad, setIsInitialLoad] = useState(true);

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

    // Function to fetch data based on current search params
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

    // If any search param changes, rerun fetchData
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
            updateSearchParams({ page: "1" });
        }
    }, [itemsPerPage]);

    // Function to update search params
    const updateSearchParams = (
        newFilters: Record<string, string | null>
    ): void => {
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

    return {
        search,
        category,
        subcategory,
        page,
        sort,
        fetchData,
        updateSearchParams,
    };
}

export default useShopLogic;
