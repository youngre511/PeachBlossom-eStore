import React from "react";
import { useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import AVProductCatalog from "../../features/AVProductCatalog";
import { AVFilters } from "../../features/avCatalogTypes";
import { avFetchProducts } from "../../features/avCatalogSlice";
import { arraysEqual } from "../../../common/utils/arraysEqual";
import { RootState } from "../../store/store";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";

interface Props {}
const ProductManagement: React.FC<Props> = () => {
    const avCatalog = useAppSelector((state: RootState) => state.avCatalog);
    const dispatch = useAppDispatch();
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
    const itemsPerPage = searchParams.get("itemsPerPage") || 12;
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
            ...avCatalog.filters,
            itemsPerPage: itemsPerPage,
        }).map((value) => (value ? value.toString() : ""));
        const filtersChanged = !arraysEqual(currentFilters, existingFilters);
        if (filtersChanged) {
            dispatch(avFetchProducts(params as AVFilters));
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
            sortMethod,
            page,
        };
        console.log(params);
        dispatch(avFetchProducts(params as AVFilters));
    }, [searchParams, setSearchParams]);

    return (
        <div className="product-management">
            <div>ProductManagement</div>
            <AVProductCatalog
                page={+page}
                results={avCatalog.numberOfResults}
            />
        </div>
    );
};
export default ProductManagement;
