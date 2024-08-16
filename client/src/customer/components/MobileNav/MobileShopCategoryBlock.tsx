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
}
const MobileShopCategoryBlock: React.FC<Props> = ({
    category,
    forceCollapse,
    setMenusExpanded,
    menusExpanded,
}) => {
    const navigate = useNavigate();
    const [isExpanded, setIsExpanded] = useState<boolean>(false);

    useEffect(() => {
        console.log("force collapsing:", forceCollapse);
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
                        navigate(`/shop?category=${category.categoryName}`);
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
                        ? `${category.SubCategory.length * 48}px`
                        : 0,
                }}
            >
                {category.SubCategory.map((subcategory) => (
                    <div
                        className="m-shop-subcategory"
                        onClick={() => {
                            navigate(
                                `/shop?category=${
                                    category.categoryName
                                }&sub_category=${encodeURI(
                                    subcategory.subCategoryName
                                )}`
                            );
                        }}
                        key={subcategory.subCategoryName}
                    >
                        {subcategory.subCategoryName}
                    </div>
                ))}
            </div>
        </div>
    );
};
export default MobileShopCategoryBlock;
