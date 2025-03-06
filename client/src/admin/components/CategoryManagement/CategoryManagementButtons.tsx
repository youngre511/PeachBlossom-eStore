import React, { SetStateAction } from "react";
import { useEffect } from "react";
import { Tooltip } from "@mui/material";
import { Button } from "@mui/material";
import DeleteForeverSharpIcon from "@mui/icons-material/DeleteForeverSharp";
import AddBoxSharpIcon from "@mui/icons-material/AddBoxSharp";
import { AccessLevel } from "../../features/Users/userTypes";
import EditSharpIcon from "@mui/icons-material/EditSharp";
import {
    AVCategory,
    Subcategory,
} from "../../features/AVMenuData/avMenuDataTypes";

const buttonStyles = {
    width: "60px",
    minWidth: "60px",
    height: "60px",
    borderRadius: 0,
};

interface CategoryManagementButtonsProps {
    type: "category" | "subcategory";
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
const CategoryManagementButtons: React.FC<CategoryManagementButtonsProps> = ({
    type,
    setPopupType,
    accessLevel,
    selectedCategory,
    selectedSubcategory,
    deleteTooltip,
}) => {
    const isCategory = type === "category";

    return (
        <div className="catMan-buttons">
            <Tooltip
                title={
                    isCategory
                        ? "Add category"
                        : `Add subcategory to ${selectedCategory?.categoryName}`
                }
            >
                <Button
                    variant="contained"
                    onClick={() =>
                        setPopupType(isCategory ? "addCat" : "addSubcat")
                    }
                    disabled={
                        accessLevel === "view only" ||
                        (!isCategory && !selectedCategory)
                    }
                    aria-label={`add ${type}`}
                    sx={{
                        ...buttonStyles,
                        borderTopLeftRadius: "5px",
                    }}
                >
                    <AddBoxSharpIcon />
                </Button>
            </Tooltip>
            <Tooltip title={`Edit selected ${type} name`}>
                <Button
                    variant="contained"
                    disabled={
                        (isCategory && !selectedCategory) ||
                        (!isCategory && !selectedSubcategory) ||
                        accessLevel === "view only"
                    }
                    onClick={() =>
                        setPopupType(isCategory ? "editCat" : "editSubcat")
                    }
                    aria-label={`edit ${type} name`}
                    sx={buttonStyles}
                >
                    <EditSharpIcon />
                </Button>
            </Tooltip>
            <Tooltip title={isCategory ? deleteTooltip : ""}>
                <span>
                    <Button
                        variant="contained"
                        disabled={
                            (isCategory &&
                                (!selectedCategory ||
                                    selectedCategory.productCount > 0)) ||
                            (!isCategory && !selectedSubcategory) ||
                            accessLevel === "view only"
                        }
                        onClick={() =>
                            setPopupType(
                                isCategory ? "deleteCat" : "deleteSubcat"
                            )
                        }
                        aria-label={`delete ${type}`}
                        sx={{
                            ...buttonStyles,
                            borderBottomLeftRadius: "5px",
                        }}
                    >
                        <DeleteForeverSharpIcon />
                    </Button>
                </span>
            </Tooltip>
        </div>
    );
};
export default CategoryManagementButtons;
