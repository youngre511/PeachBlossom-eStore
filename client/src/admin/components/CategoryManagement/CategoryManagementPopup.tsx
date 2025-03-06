import React, { SetStateAction, useState } from "react";
import { useEffect } from "react";
import {
    AVCategory,
    Subcategory,
} from "../../features/AVMenuData/avMenuDataTypes";
import { Button, TextField } from "@mui/material";
import { PopupTypeType } from "./CategoryManagement";
import BlankPopup from "../../../common/components/BlankPopup";

interface CategoryManagementPopupProps {
    popupType: PopupTypeType;
    setPopupType: React.Dispatch<SetStateAction<PopupTypeType>>;
    popupVisible: boolean;
    setPopupVisible: React.Dispatch<SetStateAction<boolean>>;
    popupInputValue: string;
    setPopupInputValue: React.Dispatch<SetStateAction<string>>;
    selectedCategory: AVCategory | null;
    selectedSubcategory: Subcategory | null;
    handleDeleteCategory: (e: React.MouseEvent<HTMLElement>) => void;
    handleDeleteSubcategory: (e: React.MouseEvent<HTMLElement>) => void;
    handleEditCategory: (e: React.MouseEvent<HTMLElement>) => void;
    handleEditSubcategory: (e: React.MouseEvent<HTMLElement>) => void;
    handleAddCategory: (e: React.MouseEvent<HTMLElement>) => void;
    handleAddSubcategory: (e: React.MouseEvent<HTMLElement>) => void;
}
const CategoryManagementPopup: React.FC<CategoryManagementPopupProps> = ({
    popupType,
    setPopupType,
    popupVisible,
    setPopupVisible,
    popupInputValue,
    setPopupInputValue,
    selectedCategory,
    selectedSubcategory,
    handleDeleteCategory,
    handleDeleteSubcategory,
    handleEditCategory,
    handleEditSubcategory,
    handleAddCategory,
    handleAddSubcategory,
}) => {
    const [popupMessage, setPopupMessage] = useState<string | null>(null);

    const handleChangePopupInput = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        if (e.target.value.length <= 20) {
            setPopupInputValue(e.target.value);
        }
    };

    const handlePopupCancel = () => {
        setPopupVisible(false);
        setPopupInputValue("");
        setPopupType(null);
    };

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
                setPopupInputValue(selectedSubcategory?.subcategoryName || "");
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

    return (
        <React.Fragment>
            {popupVisible && popupType && (
                <BlankPopup className={`${popupType}-popup`}>
                    {/* Conditional rendering of blank popup contents based on set popup type */}
                    <span className="catMan-popup-message">{popupMessage}</span>
                    {popupType !== "deleteCat" &&
                        popupType !== "deleteSubcat" && (
                            <TextField
                                variant="outlined"
                                value={popupInputValue}
                                onChange={(e) => handleChangePopupInput(e)}
                                sx={{
                                    width: "200px",
                                    "& .MuiInputBase-root": {
                                        backgroundColor: "white",
                                    },
                                }}
                            />
                        )}
                    <div className="popup-button-group">
                        {popupType == "addCat" && (
                            <Button
                                variant="contained"
                                onClick={handleAddCategory}
                                disabled={!popupInputValue}
                                sx={{ width: "90px" }}
                            >
                                Add
                            </Button>
                        )}
                        {popupType == "addSubcat" && (
                            <Button
                                variant="contained"
                                onClick={handleAddSubcategory}
                                disabled={!popupInputValue}
                                sx={{ width: "90px" }}
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
                                sx={{ width: "90px" }}
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
                                        selectedSubcategory.subcategoryName
                                }
                                onClick={handleEditSubcategory}
                                sx={{ width: "90px" }}
                            >
                                Save
                            </Button>
                        )}
                        {popupType == "deleteCat" && (
                            <Button
                                variant="contained"
                                onClick={handleDeleteCategory}
                                sx={{ width: "90px" }}
                            >
                                Yes
                            </Button>
                        )}
                        {popupType == "deleteSubcat" && (
                            <Button
                                variant="contained"
                                onClick={handleDeleteSubcategory}
                                sx={{ width: "90px" }}
                            >
                                Yes
                            </Button>
                        )}
                        <Button
                            variant="contained"
                            onClick={handlePopupCancel}
                            sx={{ width: "90px" }}
                        >
                            Cancel
                        </Button>
                    </div>
                </BlankPopup>
            )}
        </React.Fragment>
    );
};
export default CategoryManagementPopup;
