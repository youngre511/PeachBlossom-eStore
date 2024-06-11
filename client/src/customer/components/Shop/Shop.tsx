import React from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

import { RootState } from "../../store/store";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { fetchProducts } from "../../features/ProductCatalogue/catalogueSlice";
import ProductCatalogue from "../../features/ProductCatalogue/ProductCatalogue";
import FilterOptions from "../../features/FilterOptions/FilterOptions";
import SortMethodSelector from "../../features/SortMethodSelector/SortMethodSelector";

const Shop = () => {
    const dispatch = useAppDispatch();
    const catalogue = useAppSelector((state: RootState) => state.catalogue);
    const currentSortMethod = catalogue.filters.sortMethod;
    const itemsPerPage = useAppSelector(
        (state: RootState) => state.userPreferences.itemsPerPage
    );

    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const subCategory = searchParams.get("sub_category");
    const page = searchParams.get("page") || "1";
    const size = searchParams.get("size")?.split(",") || null;
    const color = searchParams.get("color")?.split(",") || null;
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const minWidth = searchParams.get("min_width");
    const maxWidth = searchParams.get("max_width");
    const minHeight = searchParams.get("min_Height");
    const maxHeight = searchParams.get("max_Height");
    const minDepth = searchParams.get("min_Depth");
    const maxDepth = searchParams.get("max_Depth");
    const minCircum = searchParams.get("min_Circum");
    const maxCircum = searchParams.get("max_Circum");
    const minDiam = searchParams.get("min_Diam");
    const maxDiam = searchParams.get("max_Diam");
    const tags = searchParams.get("tags")?.split(",") || null;
    const sortMethod = searchParams.get("sort") || "name-ascend";
    const material = searchParams.get("material")?.split(",") || null;

    useEffect(() => {
        const params = {
            search,
            category,
            subCategory,
            size,
            color,
            minPrice,
            maxPrice,
            minWidth,
            maxWidth,
            minHeight,
            maxHeight,
            minDepth,
            maxDepth,
            minCircum,
            maxCircum,
            minDiam,
            maxDiam,
            tags,
            material,
            sortMethod,
            page,
        };
        //FetchLogic
        dispatch(fetchProducts(params));
        // Need to supply
    }, [
        search,
        category,
        page,
        size,
        color,
        minPrice,
        maxPrice,
        minWidth,
        maxWidth,
        minDepth,
        maxDepth,
        minHeight,
        maxHeight,
        minCircum,
        maxCircum,
        minDiam,
        maxDiam,
        tags,
        sortMethod,
        material,
        itemsPerPage,
    ]);

    const updateSearchParams = (newFilters: Record<string, string>): void => {
        Object.keys(newFilters).forEach((key) => {
            if (newFilters[key]) {
                searchParams.set(key, newFilters[key]);
            } else {
                searchParams.delete(key);
            }
        });
        setSearchParams(searchParams);
    };

    return (
        <div className="shop-container">
            <div className="shop-header">
                <h1>Category</h1>
                <p>number of results</p>
                <SortMethodSelector
                    currentSortMethod={currentSortMethod}
                    updateSearchParams={updateSearchParams}
                />
            </div>
            <div className="products-and-filters">
                {/* <FilterOptions /> */}
                <ProductCatalogue />
            </div>
        </div>
    );
};
export default Shop;
