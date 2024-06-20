import React from "react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/customerStore";
import Item from "../../components/Item/Item";
import { Product } from "./CatalogTypes";
import { CircularProgress } from "@mui/material";

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
            <div className="catalog-item-container">
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
