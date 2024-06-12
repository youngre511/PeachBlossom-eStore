import React from "react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { setItemsPerPage } from "../UserPreferences/userPreferencesSlice";
import { RootState } from "../../store/customerStore";
import Item from "../../components/Item/Item";
import { Product } from "./CatalogTypes";

interface Props {}
const ProductCatalog: React.FC<Props> = () => {
    const dispatch = useAppDispatch();
    const { products, loading, error } = useAppSelector(
        (state: RootState) => state.catalog
    );
    const itemsPerPage = useAppSelector(
        (state: RootState) => state.userPreferences.itemsPerPage
    );

    const handleItemsPerPageChange = (newItemsPerPage: 24 | 48 | 96) => {
        dispatch(setItemsPerPage(newItemsPerPage));
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="productCatalog">
            {products.length > 0 &&
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
                    />
                ))}
        </div>
    );
};
export default ProductCatalog;
