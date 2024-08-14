import React, { useState } from "react";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Product } from "../../features/ProductCatalog/CatalogTypes";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { fetchOneProduct } from "../../features/ProductCatalog/catalogSlice";
import { RootState } from "../../store/customerStore";
import Carousel from "react-multi-carousel";
import "./product-details.css";

interface Props {}
const ProductDetails: React.FC<Props> = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const productNo = searchParams.get("pn");
    const [product, setProduct] = useState<Product | null>(null);
    const [currentImage, setCurrentImage] = useState<string>("");
    const productState = useAppSelector(
        (state: RootState) => state.catalog.singleProduct
    );
    const dispatch = useAppDispatch();

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

    const responsive = {
        desktop: {
            breakpoint: { max: 6000, min: 1024 },
            items: 4,
            slidesToSlide: 3, // optional, default to 1.
        },
        tablet: {
            breakpoint: { max: 1024, min: 464 },
            items: 1,
            slidesToSlide: 1, // optional, default to 1.
        },
        mobile: {
            breakpoint: { max: 464, min: 0 },
            items: 1,
            slidesToSlide: 1, // optional, default to 1.
        },
    };

    return (
        <div>
            {product && (
                <div className="product-images">
                    {product.images.length > 1 && (
                        <Carousel
                            swipeable={true}
                            draggable={false}
                            showDots={true}
                            responsive={responsive}
                            ssr={true} // means to render carousel on server-side.
                            infinite={true}
                            keyBoardControl={true}
                            customTransition="transform 300ms ease-in-out"
                            transitionDuration={500}
                            containerClass="vertical-carousel-container"
                            removeArrowOnDeviceType={["tablet", "mobile"]}
                            dotListClass="custom-dot-list-style"
                            itemClass="carousel-item"
                        >
                            {product.images.map((imageUrl, index) => (
                                <img
                                    src={imageUrl}
                                    className="product-details-thumbnail"
                                    alt={`${product.name} thumbnail ${
                                        index + 1
                                    }`}
                                    onClick={() => setCurrentImage(imageUrl)}
                                    key={imageUrl}
                                />
                            ))}
                        </Carousel>
                    )}

                    <img
                        src={currentImage}
                        className="product-details-image"
                        alt={`${product.name} thumbnail`}
                    />
                </div>
            )}
        </div>
    );
};
export default ProductDetails;
