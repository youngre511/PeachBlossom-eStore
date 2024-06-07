import React from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { setItemsPerPage } from "../UserPreferences/userPreferencesSlice";
import { RootState } from "../../store/store";
import Item from "../../components/Item/Item";
import { Product } from "./CatalogueTypes";
import { fetchProducts } from "./catalogueSlice";

interface Props {}
const ProductCatalogue: React.FC<Props> = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const dispatch = useAppDispatch();
    const { products, loading, error } = useAppSelector(
        (state: RootState) => state.catalogue
    );
    const itemsPerPage = useAppSelector(
        (state: RootState) => state.userPreferences.itemsPerPage
    );

    const search = searchParams.get("search");
    const category = searchParams.get("category");
    const subCategory = searchParams.get("sub_category");
    const page = searchParams.get("page") || "1";
    const size = searchParams.get("size")?.split(",") || null;
    const color = searchParams.get("color")?.split(",") || null;
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const minWidth = searchParams.get("min_width");
    const maxWidth = searchParams.get("max_width");
    const minHeight = searchParams.get("min_Height");
    const maxHeight = searchParams.get("max_Height");
    const minDepth = searchParams.get("min_Depth");
    const maxDepth = searchParams.get("max_Depth");
    const minCircum = searchParams.get("min_Circum");
    const maxCircum = searchParams.get("max_Circum");
    const minDiam = searchParams.get("min_Diam");
    const maxDiam = searchParams.get("max_Diam");
    const tags = searchParams.get("tags")?.split(",") || null;
    const sortMethod = searchParams.get("sort") || "name-ascend";
    const material = searchParams.get("material")?.split(",") || null;

    useEffect(() => {
        const params = {
            search,
            category,
            subCategory,
            size,
            color,
            minPrice,
            maxPrice,
            minWidth,
            maxWidth,
            minHeight,
            maxHeight,
            minDepth,
            maxDepth,
            minCircum,
            maxCircum,
            minDiam,
            maxDiam,
            tags,
            material,
            sortMethod,
            page,
        };
        //FetchLogic
        dispatch(fetchProducts(params));
        // Need to supply
    }, [
        search,
        category,
        page,
        size,
        color,
        minPrice,
        maxPrice,
        minWidth,
        maxWidth,
        minDepth,
        maxDepth,
        minHeight,
        maxHeight,
        minCircum,
        maxCircum,
        minDiam,
        maxDiam,
        tags,
        sortMethod,
        material,
        itemsPerPage,
    ]);

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
        <div className="productCatalogue">
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
export default ProductCatalogue;
