import React, { ReactNode, useState } from "react";
import { useEffect } from "react";

interface ShopHeaderProps {
    search: string | null;
    category: string | null;
    removeCategory: () => void;
    subcategory: string | null;
    removeSubcategory: () => void;
    numberOfResults: number;
    loading: boolean;
}
const ShopHeader: React.FC<ShopHeaderProps> = ({
    search,
    category,
    removeCategory,
    subcategory,
    removeSubcategory,
    numberOfResults,
    loading,
}) => {
    const [headerContent, setHeaderContent] = useState<ReactNode | null>(
        <React.Fragment>Shop All</React.Fragment>
    );
    const [loadingData, setLoadingData] = useState<boolean>(false);
    const [showingSearchResults, setShowingSearchResults] = useState<boolean>(
        !!search
    );

    useEffect(() => {
        if (!loading && loading !== loadingData) {
            if (search) {
                setHeaderContent(
                    <React.Fragment>
                        {numberOfResults} search result
                        {numberOfResults !== 1 && <span>s</span>} for "{search}"
                    </React.Fragment>
                );
            } else {
                if (subcategory) {
                    setHeaderContent(
                        <React.Fragment>
                            <span
                                className="back-to-category"
                                onClick={removeSubcategory}
                                style={{ cursor: "pointer" }}
                            >
                                {category}
                            </span>{" "}
                            / {subcategory}
                        </React.Fragment>
                    );
                } else if (category) {
                    setHeaderContent(
                        <React.Fragment>
                            <span
                                className="back-to-category"
                                onClick={removeCategory}
                                style={{ cursor: "pointer" }}
                            >
                                Shop All
                            </span>{" "}
                            / {category}
                        </React.Fragment>
                    );
                } else {
                    setHeaderContent(<React.Fragment>Shop All</React.Fragment>);
                }
            }
        }
        setLoadingData(loading);
    }, [loading, search, category, subcategory]);

    return <h1 className="shop-heading">{headerContent}</h1>;
};
export default ShopHeader;
