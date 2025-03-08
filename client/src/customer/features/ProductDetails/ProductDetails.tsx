import React, { useState } from "react";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Product } from "../../features/Shop/CatalogTypes";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { fetchOneProduct } from "../../features/Shop/catalogSlice";
import { RootState } from "../../store/customerStore";

import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "./product-details.css";
import AddToCartButton from "../AddToCartButton/AddToCartButton";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";
import { useNavigationContext } from "../../../common/contexts/navContext";
import { Button, CircularProgress } from "@mui/material";

interface Props {}
const ProductDetails: React.FC<Props> = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const productNo = searchParams.get("pn");
    const [product, setProduct] = useState<Product | null>(null);
    const [currentImage, setCurrentImage] = useState<string>("");
    const productState = useAppSelector(
        (state: RootState) => state.catalog.singleProduct
    );
    const { width, isTouchDevice } = useWindowSizeContext();
    const { previousRoute } = useNavigationContext();
    const [prevPageName, setPrevPageName] = useState<string>("");
    const dispatch = useAppDispatch();
    const [isVertical, setIsVertical] = useState<boolean>(true);
    const [imageSizes, setImageSizes] = useState<{
        size1: number;
        size2: number;
        size3: number;
    }>({ size1: 960, size2: 1024, size3: 1024 });
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);

    useEffect(() => {
        if (width && width < 1342) {
            setIsVertical(false);
            setImageSizes({ size1: 960, size2: 1024, size3: 1024 });
        } else {
            setIsVertical(true);
            setImageSizes({ size1: 450, size2: 960, size3: 1024 });
        }
    }, [width]);

    useEffect(() => {
        if (previousRoute) {
            if (previousRoute.startsWith("/shoppingcart")) {
                setPrevPageName(" to Cart");
            } else if (previousRoute.startsWith("/shop")) {
                setPrevPageName(" to Product Catalog");
            } else {
                setPrevPageName("");
            }
        }
    }, [previousRoute]);

    const settings: Settings = {
        swipe: true,
        draggable: false,
        dots:
            width && width <= 1024 && product && product.images.length > 1
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
                        isTouchDevice
                            ? false
                            : true,
                },
            },
        ],
    };

    useEffect(() => {
        if (productNo) {
            if (productState) {
                if (productState.productNo !== productNo) {
                    setProduct(null);
                    dispatch(fetchOneProduct(productNo));
                } else {
                    setProduct(productState);
                    if (productState.images.length > 0) {
                        setCurrentImage(productState.images[0]);
                    }
                }
            } else {
                dispatch(fetchOneProduct(productNo));
            }
        }
    }, [productState, productNo, dispatch]);

    return (
        <div className="product-details">
            <div className="pd-back-btn">
                {previousRoute && (
                    <Button
                        variant="outlined"
                        onClick={() => navigate(previousRoute)}
                    >
                        &lt; Back{prevPageName}
                    </Button>
                )}
            </div>
            <div className="product-details-container">
                {product && (
                    <React.Fragment>
                        <div className="product-images-cont">
                            <div className="product-images">
                                {((width && width < 1025) ||
                                    product.images.length > 1) && (
                                    <Slider {...settings} key={width}>
                                        {product.images.map(
                                            (imageUrl, index) => {
                                                let size1: number = 1024;
                                                let size2: number = 1024;
                                                let size3: number = 1024;
                                                if (width) {
                                                    if (width >= 1024) {
                                                    } else if (width >= 1025) {
                                                        size1 = 140;
                                                        size2 = 300;
                                                        size3 = 450;
                                                    } else if (width >= 751) {
                                                        size1 = 450;
                                                        size2 = 1024;
                                                        size3 = 1024;
                                                    } else {
                                                        size1 = 300;
                                                        size2 = 600;
                                                        size3 = 960;
                                                    }
                                                }
                                                return (
                                                    <img
                                                        src={`${imageUrl}_1024.webp`}
                                                        srcSet={`${imageUrl}_${size1}.webp, ${imageUrl}_${size2}.webp 2x, ${imageUrl}_${size3}.webp 3x,`}
                                                        className="product-details-thumbnail"
                                                        alt={`${
                                                            product.name
                                                        } thumbnail ${
                                                            index + 1
                                                        }`}
                                                        onClick={() =>
                                                            setCurrentImage(
                                                                imageUrl
                                                            )
                                                        }
                                                        key={imageUrl}
                                                    />
                                                );
                                            }
                                        )}
                                    </Slider>
                                )}
                                <div className="product-details-image-cont">
                                    {!imageLoaded && (
                                        <div
                                            className="image-placeholder"
                                            style={{
                                                width: 450,
                                                height: 450,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                            }}
                                        >
                                            <CircularProgress />
                                        </div>
                                    )}
                                    <img
                                        src={`${currentImage}_1024.webp`}
                                        srcSet={`${currentImage}_${imageSizes.size1}.webp, ${currentImage}_${imageSizes.size2}.webp 2x, ${currentImage}_${imageSizes.size3}.webp 3x`}
                                        className="product-details-image"
                                        alt={`${product.name} thumbnail`}
                                        width="450x"
                                        height="450px"
                                        onLoad={() => setImageLoaded(true)}
                                        style={
                                            imageLoaded
                                                ? {}
                                                : { display: "none" }
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="product-info">
                            <div className="pd-top">
                                <div className="pd-header">
                                    {product.discountPrice && (
                                        <div className="pd-sale-label">
                                            SALE
                                        </div>
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
                                        {product.attributes.dimensions.height}{" "}
                                        in. h &times;
                                        {
                                            product.attributes.dimensions.width
                                        }{" "}
                                        in. w &times;
                                        {
                                            product.attributes.dimensions.depth
                                        }{" "}
                                        in. d
                                    </dd>
                                    <dt>Product No.</dt>
                                    <dd>{product.productNo}</dd>
                                </dl>
                            </div>
                            <AddToCartButton
                                available={product.stock}
                                productNo={product.productNo}
                                isTouchDevice={isTouchDevice}
                            />
                        </div>
                    </React.Fragment>
                )}
            </div>
        </div>
    );
};
export default ProductDetails;
