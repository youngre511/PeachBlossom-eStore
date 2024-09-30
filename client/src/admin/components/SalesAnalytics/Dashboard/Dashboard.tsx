import React from "react";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { RootState } from "../../../store/store";
import {
    fetchRevenueOverTime,
    fetchYTD,
} from "../../../features/Analytics/analyticsSlice";
import "./dashboard.css";
import "../sales-analytics.css";
import { BarData } from "../../../features/Analytics/analyticsTypes";
import BarChartSharpIcon from "@mui/icons-material/BarChartSharp";
import ShowChartSharpIcon from "@mui/icons-material/ShowChartSharp";
import CustomLineChart from "../CustomCharts/CustomLineChart";
import { IconButton, SvgIcon, Typography } from "@mui/material";
import CustomBarChart from "../CustomCharts/CustomBarChart";

import TopProducts from "../Product Performance/TopProducts";

const Dashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const analytics = useAppSelector((state: RootState) => state.analytics);
    const rotData = analytics.revenueOverTime.rotData;
    const salesSummary = analytics.salesSummary;

    const [rotChartType, setRotChartType] = useState<"bar" | "line">("line");
    const [lastYearRevenue, setLastYearRevenue] = useState<
        | {
              id: number | string;
              data: Array<{ x: string; y: number }>;
          }[]
        | null
    >(null);

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
        if (rotData.length > 0 && rotChartType === "line") {
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
                        {rotData.length > 0 && rotChartType === "bar" && (
                            <CustomBarChart
                                data={rotData as BarData[]}
                                stacked={false}
                                includeLegend={false}
                                tiltLabels={true}
                                valueFormat=">-$,.2r"
                                margin={{
                                    top: 0,
                                    right: 60,
                                    bottom: 120,
                                    left: 100,
                                }}
                                yAxisFormat={(value: number) =>
                                    `$${value.toLocaleString("en-US")}`
                                }
                                enableLabel={false}
                            />
                        )}
                    </div>
                </div>
                <div className="sales-summary analytics-box">
                    <div className="box-header">
                        <h2>Sales Summary</h2>
                    </div>
                    <div className="summary-contents">
                        <div className="summary-datum">
                            <div className="summary-label">YTD Revenue</div>
                            <div className="summary-figure">
                                {"$" +
                                    Number(
                                        salesSummary.ytdRevenue
                                    ).toLocaleString()}
                            </div>
                        </div>
                        <div className="summary-datum">
                            <div className="summary-label">
                                Current Month Revenue
                            </div>
                            <div className="summary-figure">
                                {"$" +
                                    Number(
                                        salesSummary.mtdRevenue
                                    ).toLocaleString()}
                            </div>
                        </div>
                        <div className="summary-datum">
                            <div className="summary-label">
                                YTD Transactions
                            </div>
                            <div className="summary-figure">
                                {salesSummary.ytdTransactions}
                            </div>
                        </div>
                        <div className="summary-datum">
                            <div className="summary-label">
                                Current Month Transactions
                            </div>
                            <div className="summary-figure">
                                {salesSummary.mtdTransactions}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="top-products analytics-box">
                <TopProducts number="5" worst={false} />
            </div>
        </div>
    );
};
export default Dashboard;
