import React, { useState, SetStateAction } from "react";
import { useEffect } from "react";
import ExpandMoreSharpIcon from "@mui/icons-material/ExpandMoreSharp";
import { Category } from "../../features/Categories/CategoriesTypes";
import { useNavigate } from "react-router-dom";

interface Props {
    category: Category;
    forceCollapse: boolean;
    setMenusExpanded: React.Dispatch<SetStateAction<string[]>>;
    menusExpanded: string[];
    handleCloseMenu: () => void;
}
const MobileShopCategoryBlock: React.FC<Props> = ({
    category,
    forceCollapse,
    setMenusExpanded,
    menusExpanded,
    handleCloseMenu,
}) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    useEffect(() => {
        if (forceCollapse) {
            setIsExpanded(false);
        }
    }, [forceCollapse]);

    useEffect(() => {
        if (isExpanded) {
            setMenusExpanded([...menusExpanded, category.categoryName]);
        } else {
            const expandedArray = [...menusExpanded];
            const menuIndex = expandedArray.indexOf(category.categoryName);
            if (menuIndex !== -1) {
                expandedArray.splice(menuIndex, 1);
                setMenusExpanded(expandedArray);
            }
        }
    }, [isExpanded]);

    return (
        <div className="m-shop-category-block">
            <div className="m-shop-category">
                <div
                    className="m-shop-category-name"
                    onClick={() => {
                        handleCloseMenu();
                        navigate(
                            `/shop?category=${category.categoryName.replace(
                                "&",
                                "%26"
                            )}`
                        );
                    }}
                >
                    {category.categoryName}
                </div>
                <div
                    className="m-shop-category-expand"
                    onClick={() => setIsExpanded(!isExpanded)}
                >
                    <ExpandMoreSharpIcon
                        className="m-expand-more-icon"
                        sx={{
                            transform: isExpanded
                                ? "rotateX(180deg)"
                                : undefined,
                            transition: "all .5s ease-in-out",
                            width: "20px",
                        }}
                    />
                </div>
            </div>
            <div
                className="m-shop-subcategories"
                style={{
                    height: isExpanded
                        ? `${category.Subcategory.length * 48}px`
                        : 0,
                }}
            >
                {category.Subcategory.map((subcategory) => (
                    <div
                        className="m-shop-subcategory"
                        onClick={() => {
                            handleCloseMenu();
                            navigate(
                                `/shop?category=${category.categoryName.replace(
                                    "&",
                                    "%26"
                                )}&sub_category=${encodeURI(
                                    subcategory.subcategoryName.replace(
                                        "&",
                                        "%26"
                                    )
                                )}`
                            );
                        }}
                        key={subcategory.subcategoryName}
                    >
                        {subcategory.subcategoryName}
                    </div>
                ))}
            </div>
        </div>
    );
};
export default MobileShopCategoryBlock;
