import React, { SetStateAction } from "react";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import {
    AVCategory,
    Subcategory,
} from "../../../store/AVMenuData/avMenuDataTypes";
import CategoryManagementButtons from "./CategoryManagementButtons";
import { AccessLevel } from "../../Users/userTypes";

interface CategoryEditorProps<T extends AVCategory | Subcategory> {
    type: "category" | "subcategory";
    options: T[];
    handleSelect: (e: React.MouseEvent<HTMLElement>) => void;
    setPopupType: React.Dispatch<
        SetStateAction<
            | "addCat"
            | "addSubcat"
            | "editCat"
            | "editSubcat"
            | "deleteCat"
            | "deleteSubcat"
            | null
        >
    >;
    accessLevel: AccessLevel;
    selectedCategory: AVCategory | null;
    selectedSubcategory: Subcategory | null;
    deleteTooltip: string;
}
const CategoryEditor = <T extends AVCategory | Subcategory>({
    type,
    options,
    handleSelect,
    setPopupType,
    accessLevel,
    selectedCategory,
    selectedSubcategory,
    deleteTooltip,
}: CategoryEditorProps<T>): JSX.Element => {
    //Typeguard
    const isAVCategory = (
        option: AVCategory | Subcategory
    ): option is AVCategory => {
        return (option as AVCategory).categoryName !== undefined;
    };

    return (
        <React.Fragment>
            {type === "category" && <h2>Categories</h2>}
            {type === "subcategory" && (
                <h2>{selectedCategory?.categoryName} Subcategories</h2>
            )}
            <div className={"editor-header"}>
                <div style={{ fontWeight: 700 }}>Name</div>
                <div style={{ fontWeight: 700 }}>No. Products</div>
            </div>

            <div className="catMan-list-cont">
                <div className="catMan-category-list catMan-list">
                    {options &&
                        options.length > 0 &&
                        options.map((option) => {
                            const name = isAVCategory(option)
                                ? option.categoryName
                                : option.subcategoryName;
                            return (
                                <div
                                    className="catMan-listItem"
                                    key={name}
                                    id={name}
                                    onClick={handleSelect}
                                >
                                    <span className="catMan-category-name">
                                        {name}
                                    </span>
                                    <Link
                                        to={`/products/manage?category=${name}&sort=name-ascend&page=1&view=active&itemsPerPage=24&fcm=t`}
                                        className="catMan-category-count"
                                    >
                                        {option.productCount}
                                    </Link>
                                </div>
                            );
                        })}
                </div>
                <CategoryManagementButtons
                    type={type}
                    setPopupType={setPopupType}
                    accessLevel={accessLevel}
                    selectedCategory={selectedCategory}
                    selectedSubcategory={selectedSubcategory}
                    deleteTooltip={deleteTooltip}
                />
            </div>
        </React.Fragment>
    );
};
export default CategoryEditor;
