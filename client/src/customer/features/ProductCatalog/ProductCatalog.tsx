import React from "react";
import { useEffect, useState, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/customerStore";
import Item from "../../components/Item/Item";
import { Product } from "./CatalogTypes";
import { CircularProgress } from "@mui/material";
import "./product-catalog.css";

interface Props {
    page: number;
    results: number;
}
const ProductCatalog: React.FC<Props> = ({ page, results }) => {
    const dispatch = useAppDispatch();
    const { products, numberOfResults, loading, error } = useAppSelector(
        (state: RootState) => state.catalog
    );
    const itemsPerPage = useAppSelector(
        (state: RootState) => state.userPreferences.itemsPerPage
    );

    // Find item range

    const totalPages = Math.ceil(results / itemsPerPage);

    const [productGridWidth, setProductGridWidth] = useState(0);
    const [spacing, setSpacing] = useState<number | string>(0);
    const productGrid = useRef<HTMLDivElement | null>(null);
    const [numInRow, setNumInRow] = useState(1);

    const updateContWidth = () => {
        if (productGrid.current) {
            const rect = productGrid.current.getBoundingClientRect();
            setProductGridWidth(rect.width);
        }
    };

    useEffect(() => {
        updateContWidth();

        window.addEventListener("resize", updateContWidth);

        return () => {
            window.removeEventListener("resize", updateContWidth);
        };
    }, []);

    useEffect(() => {
        if (productGridWidth) {
            const calculatedNumInRow = Math.floor(
                (productGridWidth + 20) / 265
            );
            const calculatedSpacing =
                calculatedNumInRow > 1
                    ? Math.max(
                          (productGridWidth - 245 * calculatedNumInRow) /
                              (calculatedNumInRow - 1)
                      )
                    : 20;
            setNumInRow(calculatedNumInRow);
            setSpacing(calculatedSpacing);
        }

        // if (productGridWidth >= 512) {
        //     setSpacing((productGridWidth - 245 * numInRow) / (numInRow - 1));
        // } else {
        //     setSpacing("auto");
        // }
    }, [productGridWidth]);

    if (loading) {
        return (
            <div className="loading">
                <CircularProgress />
            </div>
        );
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="productCatalog">
            <div
                className="catalog-item-container"
                ref={productGrid}
                style={{
                    gap: spacing || "20px",
                    gridTemplateColumns: `repeat(${numInRow}, 1fr)`,
                }}
            >
                {numberOfResults === 0 && (
                    <h2>
                        No products matching criteria. Try selecting different
                        filters.
                    </h2>
                )}
                {products &&
                    numberOfResults > 0 &&
                    products.map((product: Product) => (
                        <Item
                            productNo={product.productNo}
                            name={product.name}
                            description={product.description}
                            price={product.price}
                            discountPrice={product.discountPrice}
                            promotionDesc={product.promotionDesc}
                            singleProductProm={product.singleProductProm}
                            attributes={product.attributes}
                            images={product.images}
                            stock={product.stock}
                            key={product.productNo}
                        />
                    ))}
            </div>
            <div className="pagination"></div>
        </div>
    );
};
export default ProductCatalog;
