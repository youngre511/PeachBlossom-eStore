import React from "react";
import { useEffect } from "react";
import AddToCartButton from "../AddToCartButton/AddToCartButton";
import { Product } from "../../features/ProductCatalog/CatalogTypes";
import "./item.css";
import { useNavigate } from "react-router-dom";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

const Item: React.FC<Product> = ({
    productNo,
    name,
    description,
    price,
    discountPrice,
    promotionDesc,
    singleProductProm,
    attributes,
    images,
    stock,
}: Product) => {
    const className = stock > 0 ? "item" : "item out-of-stock";
    const navigate = useNavigate();
    const handleProductClick = () => {
        navigate(`/product?pn=${productNo}`);
    };
    const { width, isTouchDevice } = useWindowSizeContext();
    // discountPrice = 20.99;
    return (
        <div className="item" id={productNo}>
            <img
                src={`${images[0]}_960.webp`}
                srcSet={`${images[0]}_300.webp 150w, ${images[0]}_300.webp 300w, ${images[0]}_300.webp 150w 2x, ${images[0]}_600.webp 300w 2x, ${images[0]}_450.webp 150w 3x, ${images[0]}_960.webp 300w 3x`}
                sizes="(min-width: 550px) 300px, 150px"
                alt={name}
                onClick={handleProductClick}
                width={width && width >= 550 ? "300" : "150"}
                height={width && width >= 550 ? "300" : "150"}
                loading="lazy"
            />
            <div className="cat-prod-info">
                <h2 className="cat-prod-name" onClick={handleProductClick}>
                    {name}
                </h2>
                <div className="price-and-add">
                    {discountPrice && (
                        <div className="sale-pricing">
                            <p className="sale-price">
                                sale ${discountPrice.toFixed(2)}
                            </p>
                            <p className="reg-price">
                                reg. ${price.toFixed(2)}
                            </p>
                            {!singleProductProm && promotionDesc && (
                                <p className="cat-promo-desc">
                                    {promotionDesc}
                                </p>
                            )}
                        </div>
                    )}
                    {!discountPrice && <p className="cat-price">${price}</p>}
                    <AddToCartButton
                        available={stock}
                        productNo={productNo}
                        isTouchDevice={isTouchDevice}
                    />
                </div>
            </div>
        </div>
    );
};
export default Item;
