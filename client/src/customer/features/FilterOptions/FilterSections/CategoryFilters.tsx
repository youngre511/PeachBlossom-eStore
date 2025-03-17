import React from "react";
import { useEffect } from "react";
import { Filters } from "../../Shop/CatalogTypes";
import { useAppSelector } from "../../../hooks/reduxHooks";
import { RootState } from "../../../store/customerStore";
import { Category } from "../../../store/categories/CategoriesTypes";

interface CategoryFiltersProps {
    addCategory: (category: string) => void;
    addSubcategory: (subcategory: string) => void;
}
const CategoryFilters: React.FC<CategoryFiltersProps> = ({
    addCategory,
    addSubcategory,
}) => {
    const existingFilters: Filters = useAppSelector(
        (state: RootState) => state.catalog.filters
    );
    const categories: Category[] = useAppSelector(
        (state: RootState) => state.categories.categories
    );
    return (
        <React.Fragment>
            {existingFilters.category ? (
                <div className="filter-subcategory-cont">
                    {categories
                        .filter(
                            (category) =>
                                category.categoryName ===
                                existingFilters.category
                        )[0]
                        .Subcategory.map((subcategory, index) => (
                            <div
                                className="filter-subcategory"
                                key={index}
                                onClick={() =>
                                    addSubcategory(subcategory.subcategoryName)
                                }
                                role="button"
                            >
                                {subcategory.subcategoryName}
                            </div>
                        ))}
                </div>
            ) : (
                <div className="category-filters">
                    {categories &&
                        categories.map((category, index) => (
                            <div className="filter-category-cont" key={index}>
                                <div
                                    className="filter-category"
                                    onClick={() =>
                                        addCategory(category.categoryName)
                                    }
                                    role="button"
                                >
                                    {category.categoryName}
                                </div>
                            </div>
                        ))}
                </div>
            )}
        </React.Fragment>
    );
};
export default CategoryFilters;
