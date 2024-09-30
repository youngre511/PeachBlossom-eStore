import React from "react";
import { useEffect, useState, useRef } from "react";
import { useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/customerStore";
import Item from "../../components/Item/Item";
import { Product } from "./CatalogTypes";
import { CircularProgress } from "@mui/material";
import "./product-catalog.css";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

interface Props {
    page: number;
    results: number;
}
const ProductCatalog: React.FC<Props> = ({ page, results }) => {
    const { products, numberOfResults, loading, error } = useAppSelector(
        (state: RootState) => state.catalog
    );
    const [productList, setProductList] = useState<Product[]>([]);
    const [preloading, setPreloading] = useState<boolean>(true);
    const [productGridWidth, setProductGridWidth] = useState(0);
    const [spacing, setSpacing] = useState<number | string>(0);
    const productGrid = useRef<HTMLDivElement | null>(null);
    const [numInRow, setNumInRow] = useState(1);
    const { width, pixelDensity } = useWindowSizeContext();

    // Function to update the product grid width state
    const updateContWidth = () => {
        if (productGrid.current) {
            const rect = productGrid.current.getBoundingClientRect();

            setProductGridWidth(rect.width);
        }
    };

    // When fetch request initiates loading, clear the productList state and set preloading to true
    // Once loading is finished, either set preloading to false if it is empty or assign the results to productList
    useEffect(() => {
        if (loading) {
            setProductList([]);
            setPreloading(true);
        } else if (products.length > 0) {
            setProductList(products);
        } else {
            setPreloading(false);
        }
    }, [products, loading]);

    // When productList state has content, preload all images by creating dummy HTML elements, and set preloading to false once done.
    useEffect(() => {
        const preloadImages = async () => {
            try {
                const imagePromises = productList.map(
                    (product) =>
                        new Promise((resolve, reject) => {
                            let srcset: string = `${product.images[0]}_300.webp 150w, ${product.images[0]}_600.webp 300w`;
                            switch (pixelDensity) {
                                case 3:
                                    srcset = `${product.images[0]}_450.webp 150w, ${product.images[0]}_960.webp 300w`;
                                    break;
                                case 2:
                                    srcset = `${product.images[0]}_300.webp 150w, ${product.images[0]}_600.webp 300w`;
                                    break;
                                default:
                                    srcset = `${product.images[0]}_300.webp 150w, ${product.images[0]}_300.webp 300w`;
                                    break;
                            }
                            const img = new Image();
                            img.srcset = srcset;
                            img.src = `${product.images[0]}_600.webp`;
                            img.sizes = "(min-width: 550px) 300px, 150px";
                            img.onload = resolve;
                            img.onerror = reject;
                        })
                );
                await Promise.all(imagePromises);
                setPreloading(false);
            } catch (error) {
                console.error(
                    "Error fetching products or loading images:",
                    error
                );
                setPreloading(false);
            }
        };
        if (productList.length > 0) {
            preloadImages();
        }
    }, [productList]);

    // Call the updateContWidth function at page load and set up listener to run it on window resize
    useEffect(() => {
        updateContWidth();
        window.addEventListener("resize", updateContWidth);

        return () => {
            window.removeEventListener("resize", updateContWidth);
        };
    }, []);

    // When either the productGridWidth or width changes, calculate how many items should be in a row and how much space there shoudld be between them.
    // Update relevant states (used for inline style) once calculated
    useEffect(() => {
        if (productGridWidth && width && width >= 815) {
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
        } else if (width && width >= 550) {
            setNumInRow(2);
            setSpacing("20px");
        }
    }, [productGridWidth, width]);

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="productCatalog">
            {/* If preloading, display a spinner. Keep catalog-item-container so that the function setting spacing and number of columns has a reference width. */}
            {preloading ? (
                <div
                    className="catalog-item-container"
                    ref={productGrid}
                    style={{
                        gridTemplateColumns: `1fr`,
                    }}
                >
                    <div className="loading">
                        <CircularProgress />
                    </div>
                </div>
            ) : (
                <React.Fragment>
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
                                No products matching criteria. Try selecting
                                different filters.
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
                                    singleProductProm={
                                        product.singleProductProm
                                    }
                                    attributes={product.attributes}
                                    images={product.images}
                                    stock={product.stock}
                                    key={product.productNo}
                                />
                            ))}
                    </div>
                </React.Fragment>
            )}
        </div>
    );
};
export default ProductCatalog;
