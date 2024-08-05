import React, { useContext } from "react";
import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/store";
import { avFetchCategories } from "../../features/AVMenuData/avMenuDataSlice";
import { AVCategory } from "../../features/AVMenuData/avMenuDataTypes";
import "./category-management.css";
import { Button, TextField, Tooltip } from "@mui/material";
import { Link } from "react-router-dom";
import BlankPopup from "../../../common/components/BlankPopup";
import StatusPopup from "../../../common/components/StatusPopup";
import axios, { AxiosError } from "axios";
import { AuthContext } from "../../../common/contexts/authContext";

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
    const authContext = useContext(AuthContext);
    const accessLevel = authContext?.user?.accessLevel;

    // States to manage action popups
    const [popupMessage, setPopupMessage] = useState<string | null>(null);
    const [popupType, setPopupType] = useState<
        | "addCat"
        | "addSubcat"
        | "editCat"
        | "editSubcat"
        | "deleteCat"
        | "deleteSubcat"
        | null
    >(null);
    const [popupVisible, setPopupVisible] = useState<boolean>(false);
    const [popupInputValue, setPopupInputValue] = useState<string>("");

    // States to manage status popups
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [status, setStatus] = useState<"loading" | "success" | "failure">(
        "loading"
    );
    const [error, setError] = useState<null | string>(null);

    const dispatch = useAppDispatch();

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
            setSubcategories(selectedCategory.SubCategory);
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

    // Popup types to support all edit buttons
    useEffect(() => {
        switch (popupType) {
            case "addCat":
                setPopupMessage("Enter new category name:");
                setPopupVisible(true);
                break;
            case "addSubcat":
                setPopupMessage("Enter new subcategory name:");
                setPopupVisible(true);
                break;
            case "editCat":
                setPopupMessage("Enter new category name:");
                setPopupInputValue(selectedCategory?.categoryName || "");
                setPopupVisible(true);
                break;
            case "editSubcat":
                setPopupMessage("Enter new subcategory name:");
                setPopupInputValue(selectedSubcategory?.subCategoryName || "");
                setPopupVisible(true);
                break;
            case "deleteCat":
                setPopupMessage(
                    `Are you sure you want to delete the category ${selectedCategory?.categoryName}?`
                );
                setPopupVisible(true);
                break;
            case "deleteSubcat":
                setPopupMessage(
                    `Are you sure you want to delete the subcategory ${selectedCategory?.categoryName}? All products currently in this subcategory will no longer have a subcategory, but they will still belong to the parent category.`
                );
                setPopupVisible(true);
                break;
            default:
                setPopupMessage(null);
                setPopupInputValue("");
        }
    }, [popupType]);

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
                `${process.env.REACT_APP_API_URL}/category/create`,
                { name: popupInputValue }
            );
            setStatus("success");
            dispatch(avFetchCategories());
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.message);
            } else {
                setError("An unknown error occurred");
            }
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
                `${process.env.REACT_APP_API_URL}/category/${selectedCategory.categoryName}/create-sub`,
                { subCategoryName: popupInputValue }
            );
            setStatus("success");
            dispatch(avFetchCategories());
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.message);
            } else {
                setError("An unknown error occurred");
            }
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
                `${process.env.REACT_APP_API_URL}/category/delete/${selectedCategory.categoryName}`
            );
            setStatus("success");
            dispatch(avFetchCategories());
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.message);
            } else {
                setError("An unknown error occurred");
            }
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
                    process.env.REACT_APP_API_URL
                }category/subcategory/delete/${selectedSubcategory.subCategoryName.replace(
                    " ",
                    "%20"
                )}`
            );
            setStatus("success");
            dispatch(avFetchCategories());
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.message);
            } else {
                setError("An unknown error occurred");
            }
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
                `${process.env.REACT_APP_API_URL}/category/update`,
                {
                    oldName: selectedCategory.categoryName,
                    newName: popupInputValue,
                }
            );
            setStatus("success");
            dispatch(avFetchCategories());
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.message);
            } else {
                setError("An unknown error occurred");
            }
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
                `${process.env.REACT_APP_API_URL}/category/subcategory/update`,
                {
                    oldName: selectedSubcategory.subCategoryName,
                    newName: popupInputValue,
                }
            );
            setStatus("success");
            dispatch(avFetchCategories());
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.message);
            } else {
                setError("An unknown error occurred");
            }
            setStatus("failure");
        } finally {
            setPopupType(null);
        }
    };

    const handlePopupCancel = () => {
        setPopupVisible(false);
        setPopupInputValue("");
        setPopupType(null);
    };

    return (
        <div>
            <h1>Category Management</h1>
            <Button onClick={() => console.log(categories)}>log</Button>
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
                                    <Link
                                        to={`/products/manage?category=${category.categoryName}&sort=name-ascend&page=1&view=active&itemsPerPage=24`}
                                        className="catMan-category-count"
                                    >
                                        {category.productCount}
                                    </Link>
                                </div>
                            ))}
                    </div>
                    <div className="catMan-buttons">
                        <Button
                            variant="contained"
                            onClick={() => setPopupType("addCat")}
                            disabled={accessLevel === "view only"}
                        >
                            Add Category
                        </Button>
                        <Button
                            variant="contained"
                            disabled={
                                !selectedCategory || accessLevel === "view only"
                            }
                            onClick={() => setPopupType("editCat")}
                        >
                            Edit Category Name
                        </Button>
                        <Tooltip title={deleteTooltip}>
                            <span>
                                <Button
                                    variant="contained"
                                    disabled={
                                        !selectedCategory ||
                                        selectedCategory.productCount > 0 ||
                                        accessLevel === "view only"
                                    }
                                    onClick={() => setPopupType("deleteCat")}
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
                                    <Link
                                        to={`/products/manage?category=${
                                            selectedCategory?.categoryName
                                        }&sub_category=${subcategory.subCategoryName.replace(
                                            " ",
                                            "+"
                                        )}&sort=name-ascend&page=1&view=active&itemsPerPage=24`}
                                        className="catMan-category-count"
                                    >
                                        {subcategory.productCount}
                                    </Link>
                                </div>
                            ))}
                    </div>
                    <div className="catMan-buttons">
                        <Tooltip title={addSubcategoryTooltip}>
                            <Button
                                variant="contained"
                                disabled={
                                    !selectedCategory ||
                                    accessLevel === "view only"
                                }
                                onClick={() => setPopupType("addSubcat")}
                            >
                                Add Subcategory
                            </Button>
                        </Tooltip>
                        <Button
                            variant="contained"
                            disabled={
                                !selectedSubcategory ||
                                accessLevel === "view only"
                            }
                            onClick={() => setPopupType("editSubcat")}
                        >
                            Edit Subcategory Name
                        </Button>
                        <Tooltip title="">
                            <span>
                                <Button
                                    variant="contained"
                                    disabled={
                                        !selectedSubcategory ||
                                        accessLevel === "view only"
                                    }
                                    onClick={() => setPopupType("deleteSubcat")}
                                >
                                    Delete
                                </Button>
                            </span>
                        </Tooltip>
                    </div>
                </div>
            </div>
            {popupVisible && popupType && (
                <BlankPopup className={`${popupType}-popup`}>
                    {/* Conditional rendering of blank popup contents based on set popup type */}
                    <span>{popupMessage}</span>
                    {popupType !== "deleteCat" &&
                        popupType !== "deleteSubcat" && (
                            <TextField
                                variant="outlined"
                                value={popupInputValue}
                                onChange={(e) =>
                                    setPopupInputValue(e.target.value)
                                }
                            />
                        )}
                    <div className="popup-button-group">
                        {popupType == "addCat" && (
                            <Button
                                variant="contained"
                                onClick={handleAddCategory}
                                disabled={!popupInputValue}
                            >
                                Add
                            </Button>
                        )}
                        {popupType == "addSubcat" && (
                            <Button
                                variant="contained"
                                onClick={handleAddSubcategory}
                                disabled={!popupInputValue}
                            >
                                Add
                            </Button>
                        )}
                        {popupType == "editCat" && selectedCategory && (
                            <Button
                                variant="contained"
                                onClick={handleEditCategory}
                                disabled={
                                    !popupInputValue ||
                                    popupInputValue ===
                                        selectedCategory.categoryName
                                }
                            >
                                Save
                            </Button>
                        )}
                        {popupType == "editSubcat" && selectedSubcategory && (
                            <Button
                                variant="contained"
                                disabled={
                                    !popupInputValue ||
                                    popupInputValue ===
                                        selectedSubcategory.subCategoryName
                                }
                                onClick={handleEditSubcategory}
                            >
                                Save
                            </Button>
                        )}
                        {popupType == "deleteCat" && (
                            <Button
                                variant="contained"
                                onClick={handleDeleteCategory}
                            >
                                Yes
                            </Button>
                        )}
                        {popupType == "deleteSubcat" && (
                            <Button
                                variant="contained"
                                onClick={handleDeleteSubcategory}
                            >
                                Yes
                            </Button>
                        )}
                        <Button variant="contained" onClick={handlePopupCancel}>
                            Cancel
                        </Button>
                    </div>
                </BlankPopup>
            )}
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
