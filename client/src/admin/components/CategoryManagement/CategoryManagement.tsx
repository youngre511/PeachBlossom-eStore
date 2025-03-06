import React, { useContext } from "react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/store";
import { avFetchCategories } from "../../features/AVMenuData/avMenuDataSlice";
import {
    AVCategory,
    Subcategory,
} from "../../features/AVMenuData/avMenuDataTypes";
import "./category-management.css";
import StatusPopup from "../../../common/components/StatusPopup";
import axios, { AxiosError } from "axios";
import { AuthContext } from "../../../common/contexts/authContext";
import { axiosLogAndSetState } from "../../../common/utils/axiosLogAndSetState";
import CategoryManagementButtons from "./CategoryManagementButtons";
import CategoryEditor from "./CategoryEditor";
import CategoryManagementPopup from "./CategoryManagementPopup";

export type PopupTypeType =
    | "addCat"
    | "addSubcat"
    | "editCat"
    | "editSubcat"
    | "deleteCat"
    | "deleteSubcat"
    | null;

interface Props {}
const CategoryManagement: React.FC<Props> = () => {
    const dispatch = useAppDispatch();
    const authContext = useContext(AuthContext);
    const accessLevel = authContext?.user?.accessLevel;
    const token = localStorage.getItem("jwtToken");

    const categories = useAppSelector(
        (state: RootState) => state.avMenuData.categories
    );
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<AVCategory | null>(
        null
    );
    const [selectedCategoryElement, setSelectedCategoryElement] =
        useState<HTMLElement | null>(null);
    const [selectedSubcategory, setSelectedSubcategory] =
        useState<Subcategory | null>(null);
    const [selectedSubcategoryElement, setSelectedSubcategoryElement] =
        useState<HTMLElement | null>(null);

    const [deleteTooltip, setDeleteTooltip] = useState<string>("");

    // States to manage action popups

    const [popupType, setPopupType] = useState<PopupTypeType>(null);
    const [popupVisible, setPopupVisible] = useState<boolean>(false);
    const [popupInputValue, setPopupInputValue] = useState<string>("");

    // States to manage status popups
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [status, setStatus] = useState<"loading" | "success" | "failure">(
        "loading"
    );
    const [error, setError] = useState<null | string>(null);

    // On run and anytime categories (from the avMenuData slice) changes, run fetch categories if there are no categories stored.
    // If there are categories stored and there is a selected category, update the selected category to match the category in the slice or (if the category no longer exists) delete the selectedCategory value and all children subcategories.
    useEffect(() => {
        if (!categories) {
            dispatch(avFetchCategories());
        } else if (selectedCategory) {
            const category = categories.filter(
                (category) =>
                    category.categoryName === selectedCategory.categoryName
            )[0];
            if (!category) {
                setSelectedCategory(null);
                setSubcategories([]);
                setSelectedSubcategory(null);
            } else {
                setSelectedCategory(category);
            }
        }
    }, [categories]);

    // When a category is selected, update subcategories array to match that of the selected category.
    useEffect(() => {
        if (selectedCategory) {
            setSubcategories(selectedCategory.Subcategory);
        }
    }, [selectedCategory]);

    // Set tooltip values based on whether there is a selected category and whether the selected category can be deleted.
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
                    subcategory.subcategoryName === e.currentTarget.id
            )[0];
            if (selectedSubcategoryElement) {
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

    // Here there be api fetch functions for action buttons
    const handleAddCategory = async () => {
        setPopupVisible(false);
        setStatus("loading");
        setIsSaving(true);
        try {
            await axios.post(
                `${import.meta.env.VITE_API_URL}/category/create`,
                { name: popupInputValue },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            setStatus("success");
            dispatch(avFetchCategories());
        } catch (error) {
            axiosLogAndSetState(error, setError);
            setStatus("failure");
        } finally {
            setPopupType(null);
        }
    };

    const handleAddSubcategory = async () => {
        setPopupVisible(false);
        setStatus("loading");
        setIsSaving(true);
        try {
            if (!selectedCategory) {
                throw new Error("An unknown error occurred");
            }
            await axios.post(
                `${import.meta.env.VITE_API_URL}/category/${
                    selectedCategory.categoryName
                }/create-sub`,
                { subcategoryName: popupInputValue },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            setStatus("success");
            dispatch(avFetchCategories());
        } catch (error) {
            axiosLogAndSetState(error, setError);
            setStatus("failure");
        } finally {
            setPopupType(null);
        }
    };

    const handleDeleteCategory = async () => {
        setPopupVisible(false);
        setStatus("loading");
        setIsSaving(true);
        try {
            if (!selectedCategory) {
                throw new Error("An unknown error occurred");
            }
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/category/delete/${
                    selectedCategory.categoryName
                }`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            setStatus("success");
            dispatch(avFetchCategories());
        } catch (error) {
            axiosLogAndSetState(error, setError);
            setStatus("failure");
        } finally {
            setPopupType(null);
        }
    };

    const handleDeleteSubcategory = async () => {
        setPopupVisible(false);
        setStatus("loading");
        setIsSaving(true);
        try {
            if (!selectedSubcategory) {
                throw new Error("An unknown error occurred");
            }

            await axios.delete(
                `${
                    import.meta.env.VITE_API_URL
                }/category/subcategory/delete/${selectedSubcategory.subcategoryName.replace(
                    " ",
                    "%20"
                )}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            setStatus("success");
            dispatch(avFetchCategories());
        } catch (error) {
            axiosLogAndSetState(error, setError);
            setStatus("failure");
        } finally {
            setPopupType(null);
        }
    };

    const handleEditCategory = async () => {
        setPopupVisible(false);
        setStatus("loading");
        setIsSaving(true);
        try {
            if (!selectedCategory) {
                throw new Error("An unknown error occurred");
            }
            await axios.put(
                `${import.meta.env.VITE_API_URL}/category/update`,
                {
                    oldName: selectedCategory.categoryName,
                    newName: popupInputValue,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            setStatus("success");
            dispatch(avFetchCategories());
        } catch (error) {
            axiosLogAndSetState(error, setError);
            setStatus("failure");
        } finally {
            setPopupType(null);
        }
    };

    const handleEditSubcategory = async () => {
        setPopupVisible(false);
        setStatus("loading");
        setIsSaving(true);
        try {
            if (!selectedSubcategory) {
                throw new Error("An unknown error occurred");
            }
            await axios.put(
                `${import.meta.env.VITE_API_URL}/category/subcategory/update`,
                {
                    oldName: selectedSubcategory.subcategoryName,
                    newName: popupInputValue,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                }
            );
            setStatus("success");
            dispatch(avFetchCategories());
        } catch (error) {
            axiosLogAndSetState(error, setError);
            setStatus("failure");
        } finally {
            setPopupType(null);
        }
    };

    return (
        <div>
            <h1>Category Management</h1>
            {accessLevel && (
                <div className="category-manage-content">
                    <div className="catMan-categories">
                        <CategoryEditor<AVCategory>
                            type="category"
                            options={categories}
                            handleSelect={handleCategorySelect}
                            setPopupType={setPopupType}
                            accessLevel={accessLevel}
                            selectedCategory={selectedCategory}
                            selectedSubcategory={selectedSubcategory}
                            deleteTooltip={deleteTooltip}
                        />
                    </div>
                    <div className="catMan-subcategories">
                        <CategoryEditor<Subcategory>
                            type="subcategory"
                            options={subcategories}
                            handleSelect={handleSubcategorySelect}
                            setPopupType={setPopupType}
                            accessLevel={accessLevel}
                            selectedCategory={selectedCategory}
                            selectedSubcategory={selectedSubcategory}
                            deleteTooltip={deleteTooltip}
                        />
                    </div>
                </div>
            )}
            <CategoryManagementPopup
                popupType={popupType}
                setPopupType={setPopupType}
                popupVisible={popupVisible}
                setPopupVisible={setPopupVisible}
                popupInputValue={popupInputValue}
                setPopupInputValue={setPopupInputValue}
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
                handleDeleteCategory={handleDeleteCategory}
                handleDeleteSubcategory={handleDeleteSubcategory}
                handleEditCategory={handleEditCategory}
                handleEditSubcategory={handleEditSubcategory}
                handleAddCategory={handleAddCategory}
                handleAddSubcategory={handleAddSubcategory}
            />
            {isSaving && (
                <StatusPopup
                    status={status}
                    loadingMessage="Saving changes..."
                    successMessage="Changes Saved"
                    failureMessage={`Failed to save changes ${
                        error ? ": " + error : ""
                    }`}
                    actionFunction={() => {
                        setIsSaving(false);
                        setError(null);
                    }}
                />
            )}
        </div>
    );
};
export default CategoryManagement;
