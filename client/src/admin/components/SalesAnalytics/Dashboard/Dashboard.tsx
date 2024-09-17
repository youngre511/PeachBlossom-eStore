import React from "react";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { RootState } from "../../../store/store";
import {
    fetchRevenueOverTime,
    fetchTopFiveProducts,
    fetchYTD,
} from "../../../features/Analytics/analyticsSlice";
import "./dashboard.css";
import "../sales-analytics.css";
import {
    BarData,
    PieData,
    PlusParams,
} from "../../../features/Analytics/analyticsTypes";
import RefreshSharpIcon from "@mui/icons-material/RefreshSharp";
import BarChartSharpIcon from "@mui/icons-material/BarChartSharp";
import ShowChartSharpIcon from "@mui/icons-material/ShowChartSharp";
import LineAxisSharpIcon from "@mui/icons-material/LineAxisSharp";
import StackedBarChartSharpIcon from "@mui/icons-material/StackedBarChartSharp";
import PieChartOutlineSharpIcon from "@mui/icons-material/PieChartOutlineSharp";
import CustomLineChart from "../CustomCharts/CustomLineChart";
import { IconButton, SvgIcon, Typography } from "@mui/material";
import CustomBarChart from "../CustomCharts/CustomBarChart";

const Dashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const analytics = useAppSelector((state: RootState) => state.analytics);
    const rotData = analytics.revenueOverTime.rotData;
    const topProducts = analytics.topProducts;
    const salesSummary = analytics.salesSummary;

    const [rotChartType, setRotChartType] = useState<"bar" | "line">("line");
    const [lastYearRevenue, setLastYearRevenue] = useState<
        | {
              id: number | string;
              data: Array<{ x: string; y: number }>;
          }[]
        | null
    >(null);
    const [topProductsPeriod, setTopProductsPeriod] = useState<
        "7d" | "30d" | "6m" | "1y" | "allTime"
    >(topProducts.period);

    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    useEffect(() => {
        const endDate = new Date();
        endDate.setDate(0);
        dispatch(
            fetchRevenueOverTime({
                params: {
                    chartType: rotChartType,
                    startDate: startDate.toISOString().split("T")[0],
                    endDate: endDate.toISOString().split("T")[0],
                    granularity: "month",
                },
            })
        );
        if (rotChartType === "line") {
            const compiledData: {
                id: string;
                data: { x: string; y: number }[];
            } = { id: "Revenue:", data: [] };
            const sortedData = [...rotData].sort(
                (a, b) => Number(a.id) - Number(b.id)
            );
            sortedData.forEach((dataset) => {
                if (Array.isArray(dataset.data)) {
                    dataset.data.forEach((graphPoint) =>
                        compiledData.data.push({
                            x: `${graphPoint.x} ${dataset.id}`,
                            y: graphPoint.y,
                        })
                    );
                }
            });
            setLastYearRevenue([compiledData]);
        }
    }, [rotData, rotChartType]);

    useEffect(() => {
        if (
            salesSummary &&
            (!salesSummary.ytdRevenue || !salesSummary.ytdTransactions)
        ) {
            dispatch(fetchYTD());
        }
    }, [salesSummary]);

    useEffect(() => {
        if (topProducts && topProducts.products.length === 0) {
            dispatch(
                fetchTopFiveProducts({
                    period: topProductsPeriod,
                })
            );
        }
        console.log(topProducts);
    }, [topProducts, topProductsPeriod]);

    return (
        <div className="dashboard-grid">
            <div className="dashboard-top">
                <div className="dashboard-revenue analytics-box">
                    <div className="box-header">
                        <h2>Revenue Over Last Year</h2>
                        <div className="chart-selection-btns">
                            <IconButton onClick={() => setRotChartType("line")}>
                                <SvgIcon
                                    htmlColor={
                                        rotChartType === "line"
                                            ? "white"
                                            : undefined
                                    }
                                >
                                    <ShowChartSharpIcon />
                                </SvgIcon>
                            </IconButton>
                            <IconButton onClick={() => setRotChartType("bar")}>
                                <SvgIcon
                                    htmlColor={
                                        rotChartType === "bar"
                                            ? "white"
                                            : undefined
                                    }
                                >
                                    <BarChartSharpIcon />
                                </SvgIcon>
                            </IconButton>
                        </div>
                    </div>
                    <div className="dashboard-revenue-chart">
                        {lastYearRevenue && rotChartType === "line" && (
                            <CustomLineChart
                                data={lastYearRevenue}
                                xLegend="Month"
                                yLegend="Revenue"
                                idLegend={false}
                                enableSlices="x"
                                margin={{
                                    top: 10,
                                    right: 60,
                                    bottom: 80,
                                    left: 100,
                                }}
                                yAxisFormat={(value: number) =>
                                    `$${value.toLocaleString("en-US")}`
                                }
                                yFormat=">-$,.2f"
                            />
                        )}
                        {rotData && rotChartType === "bar" && (
                            <CustomBarChart
                                data={rotData}
                                stacked={false}
                                includeLegend={false}
                                tiltLabels={true}
                                valueFormat=">-$,.2r"
                                margin={{
                                    top: 10,
                                    right: 60,
                                    bottom: 80,
                                    left: 100,
                                }}
                                yAxisFormat={(value: number) =>
                                    `$${value.toLocaleString("en-US")}`
                                }
                            />
                        )}
                    </div>
                </div>
                <div className="sales-summary analytics-box">
                    <div>Total Revenue YTD</div>
                    <div>
                        {"$" + Number(salesSummary.ytdRevenue).toLocaleString()}
                    </div>
                    <div>Number of Transactions YTD</div>
                    <div>{salesSummary.ytdTransactions}</div>
                </div>
            </div>
            <div className="top-products analytics-box">
                {topProducts &&
                    topProducts.products.map((product) => (
                        <div
                            className="product-container"
                            key={product.productNo}
                        >
                            <div>{product.name}</div>
                        </div>
                    ))}
            </div>
        </div>
    );
};
export default Dashboard;
