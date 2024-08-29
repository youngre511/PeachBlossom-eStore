import React, { useState } from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Product } from "../../features/ProductCatalog/CatalogTypes";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { fetchOneProduct } from "../../features/ProductCatalog/catalogSlice";
import { RootState } from "../../store/customerStore";

import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./product-details.css";
import AddToCartButton from "../AddToCartButton/AddToCartButton";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

interface Props {}
const ProductDetails: React.FC<Props> = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const productNo = searchParams.get("pn");
    const [product, setProduct] = useState<Product | null>(null);
    const [currentImage, setCurrentImage] = useState<string>("");
    const productState = useAppSelector(
        (state: RootState) => state.catalog.singleProduct
    );
    const windowDimensions = useWindowSizeContext();
    const dispatch = useAppDispatch();
    const [isVertical, setIsVertical] = useState<boolean>(true);

    useEffect(() => {
        if (windowDimensions.width && windowDimensions.width < 1342) {
            setIsVertical(false);
        } else {
            setIsVertical(true);
        }
    }, [windowDimensions]);

    const settings: Settings = {
        swipe: true,
        draggable: false,
        dots:
            windowDimensions.width &&
            windowDimensions.width <= 1024 &&
            product &&
            product.images.length > 1
                ? true
                : false,
        infinite: false,
        speed: 500,
        cssEase: "ease-in-out",
        arrows: true,
        adaptiveHeight: false,
        className: "pd-carousel-container",
        vertical: isVertical,
        appendDots: (dots) => <ul className="custom-dot-list-style">{dots}</ul>,
        responsive: [
            {
                breakpoint: 6000, // Max width for desktop
                settings: {
                    slidesToShow: 4,
                    slidesToScroll:
                        product && product.images.length > 4
                            ? 4
                            : product?.images.length,
                    arrows: product && product.images.length > 4 ? true : false,
                },
            },
            {
                breakpoint: 1512, // Max width for desktop
                settings: {
                    slidesToShow: 3,
                    slidesToScroll:
                        product && product.images.length > 3
                            ? 3
                            : product?.images.length,
                    arrows: product && product.images.length > 3 ? true : false,
                },
            },
            {
                breakpoint: 1025, // Max width for tablet
                settings: {
                    slidesToShow: 3,
                    slidesToScroll:
                        product && product.images.length > 3
                            ? 3
                            : product?.images.length,
                    arrows: product && product.images.length > 3 ? true : false,
                },
            },
            {
                breakpoint: 1024, // Max width for tablet
                settings: {
                    slidesToShow: 1,
                    slidesToScroll: 1,
                    arrows:
                        (product && product.images.length === 1) ||
                        windowDimensions.isTouchDevice
                            ? false
                            : true,
                },
            },
        ],
    };

    useEffect(() => {
        if (productState) {
            setProduct(productState);
            if (productState.images.length > 0) {
                setCurrentImage(productState.images[0]);
            }
        }
    }, [productState]);

    useEffect(() => {
        if (productNo && (!product || product.productNo !== productNo)) {
            dispatch(fetchOneProduct(productNo));
        }
    }, [productNo]);

    return (
        <div className="product-details-container">
            {product && (
                <React.Fragment>
                    <div className="product-images-cont">
                        <div className="product-images">
                            {((windowDimensions.width &&
                                windowDimensions.width < 1025) ||
                                product.images.length > 1) && (
                                <Slider
                                    {...settings}
                                    key={windowDimensions.width}
                                >
                                    {product.images.map((imageUrl, index) => (
                                        <img
                                            src={`${imageUrl}_1024.webp`}
                                            srcSet={`${imageUrl}_300.webp 300w, ${imageUrl}_600.webp 300w 2x, ${imageUrl}_960.webp 300w 3x, ${imageUrl}_450.webp 450w, ${imageUrl}_1024.webp 960w 2x, ${imageUrl}_1024.webp 1024w 3x, ${imageUrl}_140.webp 140w, ${imageUrl}_300.webp 140w 2x, ${imageUrl}_450.webp 140w 3x,`}
                                            sizes="
                                                (min-width: 1342px) 1024px,
                                                (min-width: 1025px) 140px,
                                                (min-width: 751) 450px,
                                                300px
                                            "
                                            className="product-details-thumbnail"
                                            alt={`${product.name} thumbnail ${
                                                index + 1
                                            }`}
                                            onClick={() =>
                                                setCurrentImage(imageUrl)
                                            }
                                            key={imageUrl}
                                        />
                                    ))}
                                </Slider>
                            )}
                            <div className="product-details-image-cont">
                                <img
                                    src={`${currentImage}_1024.webp`}
                                    srcSet={`${currentImage}_450.webp 450w, ${currentImage}_960.webp 450w 2x, ${currentImage}_1024.webp 450w 3x,${currentImage}_960.webp 640w, ${currentImage}_1024.webp 640w 2x, ${currentImage}_1024.webp 640w 3x`}
                                    sizes="
                                        (min-width: 1342px) 640px,
                                        450px
                                    "
                                    className="product-details-image"
                                    alt={`${product.name} thumbnail`}
                                    width="450x"
                                    height="450px"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="product-info">
                        <div className="pd-top">
                            <div className="pd-header">
                                {product.discountPrice && (
                                    <div className="pd-sale-label">SALE</div>
                                )}
                                <h1 className="pd-product-name">
                                    {product.name}
                                </h1>
                                <div className="pd-price-cont">
                                    <span
                                        className="pd-discount-price"
                                        style={{
                                            display: product.discountPrice
                                                ? undefined
                                                : "none",
                                        }}
                                    >
                                        ${product.discountPrice}
                                    </span>
                                    <span
                                        className="pd-price"
                                        style={{
                                            textDecoration:
                                                product.discountPrice
                                                    ? "line-through"
                                                    : "none",
                                        }}
                                    >
                                        ${product.price}
                                    </span>
                                </div>
                            </div>
                            <p className="pd-description">
                                {product.description}
                            </p>
                        </div>
                        <div className="pd-attributes-cont">
                            <h2 className="pd-details-header">
                                Product Details
                            </h2>
                            <dl className="pd-attributes">
                                <dt>Color</dt>
                                <dd>{product.attributes.color}</dd>
                                <dt>Material</dt>
                                <dd>
                                    {product.attributes.material.join(", ")}
                                </dd>
                                <dt>Weight</dt>
                                <dd>{product.attributes.weight} lbs.</dd>
                                <dt>Dimensions</dt>
                                <dd>
                                    {product.attributes.dimensions.height} in. h
                                    &times;
                                    {product.attributes.dimensions.width} in. w
                                    &times;
                                    {product.attributes.dimensions.depth} in. d
                                </dd>
                                <dt>Product No.</dt>
                                <dd>{product.productNo}</dd>
                            </dl>
                        </div>
                        <AddToCartButton
                            available={product.stock}
                            productNo={product.productNo}
                            isTouchDevice={windowDimensions.isTouchDevice}
                        />
                    </div>
                </React.Fragment>
            )}
        </div>
    );
};
export default ProductDetails;
