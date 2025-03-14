import React, { useRef, useState } from "react";
import "./shop.css";

import { RootState } from "../../store/customerStore";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import ProductCatalog from "./components/ProductCatalog";
import FilterOptions from "../../features/FilterOptions/FilterOptions";
import SortMethodSelector from "./components/Header/SortMethodSelector";
import ItemsPerPageSelector from "./components/Header/ItemsPerPageSelector";
import FilterAltSharpIcon from "@mui/icons-material/FilterAltSharp";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";
import PageSelector from "../../components/PageSelector/PageSelector";
import ShopHeader from "./components/Header/ShopHeader";
import MobileSortMethodSelector from "./components/Header/MobileSortMethodSelector";
import useShopFilterDrawerAnimation from "./hooks/useShopFilterDrawerAnimation";
import useShopLogic from "./hooks/useShopLogic";

export type ShopSortOrder =
    | "name-ascend"
    | "name-descend"
    | "price-ascend"
    | "price-descend";

const Shop = () => {
    const catalog = useAppSelector((state: RootState) => state.catalog);
    const itemsPerPage = useAppSelector(
        (state: RootState) => state.userData.preferences.itemsPerPage
    );
    const { width } = useWindowSizeContext();
    const [filterDrawerOpen, setFilterDrawerOpen] = useState<boolean>(false);

    const shopRef = useRef<HTMLDivElement>(null);

    const {
        search,
        category,
        subcategory,
        page,
        sort,
        fetchData,
        updateSearchParams,
    } = useShopLogic();

    const { filterAnimationRef } = useShopFilterDrawerAnimation({
        shopRef,
        filterDrawerOpen,
        setFilterDrawerOpen,
        itemsPerPage,
        fetchData,
    });

    const changeSortOrder = (newOrder: ShopSortOrder) => {
        updateSearchParams({ sort: newOrder, page: "1" });
    };

    const removeSubcategory = (): void => {
        updateSearchParams({ page: "1", sub_category: null });
    };

    const removeCategory = (): void => {
        updateSearchParams({ page: "1", category: null });
    };

    const addSubcategoryAndCategory = (
        subcategory: string,
        category: string
    ): void => {
        updateSearchParams({
            page: "1",
            sub_category: subcategory,
            category: category,
        });
    };

    const addSubcategory = (subcategory: string): void => {
        updateSearchParams({ page: "1", sub_category: subcategory });
    };

    const addCategory = (category: string): void => {
        updateSearchParams({ page: "1", category: category });
    };

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

    return (
        <div className="shop-container" ref={shopRef}>
            <FilterOptions
                updateSearchParams={updateSearchParams}
                addSubcategory={addSubcategory}
                addSubcategoryAndCategory={addSubcategoryAndCategory}
                addCategory={addCategory}
                handleFilterDrawerClose={handleFilterDrawerClose}
            />
            <div className="product-display">
                <div className="shop-header">
                    <ShopHeader
                        search={search}
                        category={category}
                        removeCategory={removeCategory}
                        subcategory={subcategory}
                        removeSubcategory={removeSubcategory}
                        numberOfResults={catalog.numberOfResults}
                        loading={catalog.loading}
                    />
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
                            <MobileSortMethodSelector
                                sort={sort as ShopSortOrder}
                                changeSortOrder={changeSortOrder}
                            />
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
