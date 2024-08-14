import React from "react";
import { useEffect } from "react";
import AddToCartButton from "../AddToCartButton/AddToCartButton";
import { Product } from "../../features/ProductCatalog/CatalogTypes";
import "./item.css";
import { useNavigate } from "react-router-dom";

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
    // discountPrice = 20.99;
    return (
        <div className="item" id={productNo}>
            <img src={images[0]} alt={name} onClick={handleProductClick} />
            <h2 className="cat-prod-name" onClick={handleProductClick}>
                {name}
            </h2>
            <div className="price-and-add">
                {discountPrice && (
                    <div className="sale-pricing">
                        <p className="sale-price">
                            sale ${discountPrice.toFixed(2)}
                        </p>
                        <p className="reg-price">reg. ${price.toFixed(2)}</p>
                        {!singleProductProm && promotionDesc && (
                            <p className="cat-promo-desc">{promotionDesc}</p>
                        )}
                    </div>
                )}
                {!discountPrice && <p className="cat-price">${price}</p>}
                <AddToCartButton available={stock} productNo={productNo} />
            </div>
        </div>
    );
};
export default Item;
