import React from "react";
import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AVProductCatalog from "../../features/AVProductCatalog";
import { AVFilters } from "../../features/avCatalogTypes";
import { avFetchProducts } from "../../features/avCatalogSlice";
import { arraysEqual } from "../../../common/utils/arraysEqual";
import { RootState } from "../../store/store.js";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import PeachButton from "../../../common/components/PeachButton";
import AddCircleOutlineSharpIcon from "@mui/icons-material/AddCircleOutlineSharp";
import { SvgIcon } from "@mui/material";

interface Props {}
const ProductManagement: React.FC<Props> = () => {
    const avCatalog = useAppSelector((state: RootState) => state.avCatalog);
    const dispatch = useAppDispatch();

    const [searchParams, setSearchParams] = useSearchParams();
    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const subCategory = searchParams.get("sub_category");
    const page = searchParams.get("page") || "1";
    const tags = searchParams.get("tags")?.split(",") || null;
    const sortMethod = searchParams.get("sort") || "name-ascend";
    const itemsPerPage = searchParams.get("itemsPerPage") || 12;

    const navigate = useNavigate();

    const memoParams = useMemo(() => {
        return {
            search,
            category,
            subCategory,
            tags,
            sortMethod,
            page,
            itemsPerPage,
        };
    }, [search, category, subCategory, tags, sortMethod, page, itemsPerPage]);

    useEffect(() => {
        const params = {
            search,
            category,
            subCategory,
            tags,
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
    }, [search, category, subCategory, page, tags, sortMethod, itemsPerPage]);

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
            tags,
            sortMethod,
            page,
        };
        console.log(params);
        dispatch(avFetchProducts(params as AVFilters));
    }, [searchParams, setSearchParams]);

    return (
        <div className="product-management">
            <h1>Product Management</h1>
            <div className="add-and-search">
                <PeachButton
                    text={`Add New Product`}
                    onClick={() => navigate("/products/add")}
                />
            </div>
            <AVProductCatalog
                page={+page}
                results={avCatalog.numberOfResults}
            />
        </div>
    );
};
export default ProductManagement;
