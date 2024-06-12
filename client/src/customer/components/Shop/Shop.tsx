import React from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "./shop.css";

import { RootState } from "../../store/customerStore";
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
                        <button type="button">24</button>
                        <button type="button">48</button>
                        <button type="button">96</button>
                    </div>
                    <h1>{category ? category : "Shop All"}</h1>
                    <p>number of results</p>
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
