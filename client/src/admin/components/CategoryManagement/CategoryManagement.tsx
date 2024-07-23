import React from "react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/store";
import { avFetchCategories } from "../../features/AVMenuData/avMenuDataSlice";
import { AVCategory } from "../../features/AVMenuData/avMenuDataTypes";
import "./category-management.css";
import { Button, Tooltip } from "@mui/material";

interface Props {}
const CategoryManagement: React.FC<Props> = () => {
    const categories = useAppSelector(
        (state: RootState) => state.avMenuData.categories
    );
    const [subcategories, setSubcategories] = useState<
        Array<{ subCategoryName: string; productCount: number }>
    >([]);

    const [selectedCategory, setSelectedCategory] = useState<AVCategory | null>(
        null
    );
    const [selectedCategoryElement, setSelectedCategoryElement] =
        useState<HTMLElement | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState<{
        subCategoryName: string;
        productCount: number;
    } | null>(null);
    const [selectedSubcategoryElement, setSelectedSubcategoryElement] =
        useState<HTMLElement | null>(null);
    const [deleteTooltip, setDeleteTooltip] = useState<string>("");
    const [addSubcategoryTooltip, setAddSubcategoryTooltip] =
        useState<string>("");
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (selectedCategory && selectedCategory.productCount === 0) {
            setDeleteTooltip("Delete Category");
        } else if (!selectedCategory) {
            setDeleteTooltip("");
        } else {
            console.log("setting can't delete");
            setDeleteTooltip(
                "Only categories containing 0 products may be deleted"
            );
        }
    }, [selectedCategory]);

    useEffect(() => {
        if (!categories) {
            dispatch(avFetchCategories());
        }
    }, [categories]);

    useEffect(() => {
        if (selectedCategory) {
            setSubcategories(selectedCategory.SubCategory);
        }
    }, [selectedCategory]);

    const handleCategorySelect = (e: React.MouseEvent<HTMLElement>) => {
        if (e.currentTarget != selectedCategoryElement) {
            const category = categories.filter(
                (category) => category.categoryName === e.currentTarget.id
            )[0];
            if (selectedCategoryElement) {
                selectedCategoryElement.classList.remove("selected-category");
            }
            e.currentTarget.classList.add("selected-category");
            setSelectedCategoryElement(e.currentTarget);
            if (category) {
                setSelectedCategory(category);
            }
        }
    };

    const handleSubcategorySelect = (e: React.MouseEvent<HTMLElement>) => {
        if (e.currentTarget != selectedCategoryElement) {
            const subcategory = subcategories.filter(
                (subcategory) =>
                    subcategory.subCategoryName === e.currentTarget.id
            )[0];
            if (selectedSubcategoryElement) {
                console.log(selectedSubcategoryElement);
                selectedSubcategoryElement.classList.remove(
                    "selected-category"
                );
            }
            e.currentTarget.classList.add("selected-category");
            setSelectedSubcategoryElement(e.currentTarget);
            if (subcategory) {
                setSelectedSubcategory(subcategory);
            }
        }
    };

    return (
        <div>
            <h1>Category Management</h1>
            <div className="category-manage-content">
                <div className="catMan-categories">
                    <div className="catMan-category-list catMan-list">
                        {categories &&
                            categories.map((category) => (
                                <div
                                    className="catMan-listItem"
                                    key={category.categoryName}
                                    id={category.categoryName}
                                    onClick={handleCategorySelect}
                                >
                                    <span className="catMan-category-name">
                                        {category.categoryName}
                                    </span>
                                    <span className="catMan-category-count">
                                        {category.productCount}
                                    </span>
                                </div>
                            ))}
                    </div>
                    <div className="catMan-buttons">
                        <Button variant="contained">Add Category</Button>
                        <Button
                            variant="contained"
                            disabled={!selectedCategory}
                        >
                            Edit Category Name
                        </Button>
                        <Tooltip title={deleteTooltip}>
                            <span>
                                <Button
                                    variant="contained"
                                    disabled={
                                        !selectedCategory ||
                                        selectedCategory.productCount > 0
                                    }
                                >
                                    Delete
                                </Button>
                            </span>
                        </Tooltip>
                    </div>
                </div>
                <div className="catMan-subcategories">
                    <div className="catMan-category-list catMan-list">
                        {subcategories &&
                            subcategories.length > 0 &&
                            subcategories.map((subcategory) => (
                                <div
                                    className="catMan-listItem"
                                    key={subcategory.subCategoryName}
                                    id={subcategory.subCategoryName}
                                    onClick={handleSubcategorySelect}
                                >
                                    <span className="catMan-category-name">
                                        {subcategory.subCategoryName}
                                    </span>
                                    <span className="catMan-category-count">
                                        {subcategory.productCount}
                                    </span>
                                </div>
                            ))}
                    </div>
                    <div className="catMan-buttons">
                        <Tooltip title={addSubcategoryTooltip}>
                            <Button
                                variant="contained"
                                disabled={!selectedCategory}
                            >
                                Add Subcategory
                            </Button>
                        </Tooltip>
                        <Button
                            variant="contained"
                            disabled={!selectedSubcategory}
                        >
                            Edit Subcategory Name
                        </Button>
                        <Tooltip title="">
                            <span>
                                <Button
                                    variant="contained"
                                    disabled={!selectedSubcategory}
                                >
                                    Delete
                                </Button>
                            </span>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default CategoryManagement;
