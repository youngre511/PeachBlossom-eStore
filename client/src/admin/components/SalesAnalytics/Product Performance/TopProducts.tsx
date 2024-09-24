import React, { useState } from "react";
import "../sales-analytics.css";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { RootState } from "../../../store/store";
import { TopProduct } from "../../../features/Analytics/analyticsTypes";
import {
    fetchTopFiveProducts,
    fetchTopTenProducts,
    fetchTopTenWorstProducts,
} from "../../../features/Analytics/analyticsSlice";
import { useNavigate } from "react-router-dom";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";

interface Props {
    number: "5" | "10";
    worst: boolean;
}
const TopProducts: React.FC<Props> = ({ number, worst }) => {
    const dispatch = useAppDispatch();
    const analytics = useAppSelector((state: RootState) => state.analytics);
    const navigate = useNavigate();
    const { width } = useWindowSizeContext();
    const [period, setPeriod] = useState<
        "7d" | "30d" | "6m" | "1y" | "allTime"
    >("30d");
    let topProducts: {
        period: "7d" | "30d" | "6m" | "1y" | "allTime";
        products: TopProduct[];
        expiration: number | null;
        loading: boolean;
        error: string | null;
    };
    let title: string = "";

    if (number === "5") {
        topProducts = analytics.topFiveProducts;
        title = "Top Five Products";
    } else if (number === "10" && !worst) {
        topProducts = analytics.topTenProducts;
        title = "Best-Performing Products";
    } else {
        topProducts = analytics.topTenWorstProducts;
        title = "Worst-Performing Products";
    }

    useEffect(() => {
        if (topProducts && topProducts.products.length === 0) {
            if (number === "5") {
                dispatch(
                    fetchTopFiveProducts({
                        period: period,
                    })
                );
            } else if (number === "10" && !worst) {
                dispatch(
                    fetchTopTenProducts({
                        period: period,
                    })
                );
            } else {
                dispatch(
                    fetchTopTenWorstProducts({
                        period: period,
                    })
                );
            }
        }
    }, [topProducts, period]);

    return (
        <React.Fragment>
            <div className="box-header">
                <h2>{title}</h2>
            </div>
            <div className="top-products-contents">
                <div className="analytics-product top-products-header">
                    <div />
                    <div />
                    {width &&
                    (width >= 750 || (width >= 500 && width < 600)) ? (
                        <React.Fragment>
                            <div>Product No.</div>
                            <div>Product Name</div>
                        </React.Fragment>
                    ) : (
                        <div>Product</div>
                    )}

                    <div>Quantity Sold</div>
                </div>
                {topProducts &&
                    topProducts.products.map((product, index) => (
                        <div
                            className="analytics-product"
                            key={product.productNo}
                            onClick={() =>
                                navigate(
                                    `/products/product-details?product=${product.productNo}`
                                )
                            }
                        >
                            <div>{`${index + 1}.`}</div>
                            <div className="analytics-product-image">
                                <img
                                    src={`${product.thumbnailUrl}_140.webp`}
                                    alt={product.name}
                                    className="analytics-product-thumbnail"
                                    loading="lazy"
                                />
                            </div>
                            {width &&
                            (width >= 750 || (width >= 500 && width < 600)) ? (
                                <React.Fragment>
                                    <div>{product.productNo}</div>
                                    <div>{product.name}</div>
                                </React.Fragment>
                            ) : (
                                <div>
                                    <div>{product.name}</div>
                                    <div>#{product.productNo}</div>
                                </div>
                            )}

                            <div>{product.totalQuantity}</div>
                        </div>
                    ))}
            </div>
        </React.Fragment>
    );
};
export default TopProducts;
