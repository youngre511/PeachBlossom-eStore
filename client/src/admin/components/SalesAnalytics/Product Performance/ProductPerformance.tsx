import React, { useState } from "react";
import "../sales-analytics.css";
import "./product-performance.css";
import { useEffect } from "react";
import TopProducts from "./TopProducts";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { RootState } from "../../../store/store";
import {
    BarData,
    ExpandedGranularity,
    LineData,
    RBCParams,
} from "../../../features/Analytics/analyticsTypes";
import { fetchRevenueByCategory } from "../../../features/Analytics/analyticsSlice";
import { CircularProgress, IconButton, SvgIcon } from "@mui/material";
import ShowChartSharpIcon from "@mui/icons-material/ShowChartSharp";
import BarChartSharpIcon from "@mui/icons-material/BarChartSharp";
import CustomLineChart from "../CustomCharts/CustomLineChart";
import CustomBarChart from "../CustomCharts/CustomBarChart";
import DateSelector from "../DateSelector";
import GranularitySelector from "../GranularitySelector";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";

interface Props {}
const ProductPerformance: React.FC<Props> = () => {
    const dispatch = useAppDispatch();
    const { width } = useWindowSizeContext();
    const [mobile, setMobile] = useState<boolean>(true);

    useEffect(() => {
        setMobile(width && width >= 800 ? false : true);
    }, [width]);

    const analytics = useAppSelector((state: RootState) => state.analytics);

    const rbc = analytics.revenueByCategory;
    // The extra step of maintaining a local state is a response to a quirk in which when using rbcData as a constant rather than a state, rbcData, unlike ever bit of slice data used exactly the same way throughout the code, would log as undefined when returning to the component for a second time.
    const [rbcData, setRbcData] = useState<LineData[] | BarData[]>([]);
    // Maintain local state to track loading state.
    // Fixes problem of delay between chartType being changed in local params and redux slice loading state updating that was causing nivo charts to enter error state by attempting to render data of wrong type.
    const [rbcLoading, setRbcLoading] = useState<boolean>(true);
    const rbcGranularityOptions: ExpandedGranularity[] = [
        "week",
        "month",
        "quarter",
        "year",
        "all",
    ];
    const [rbcParams, setRbcParams] = useState<RBCParams>({
        startDate: undefined,
        endDate: undefined,
        chartType: "line",
        granularity: "month",
    });

    useEffect(() => {
        console.log("dispatching");
        dispatch(
            fetchRevenueByCategory({
                params: rbcParams,
            })
        );
    }, [rbcParams]);

    useEffect(() => {
        if (rbc.loading) {
            setRbcLoading(true);
        } else {
            setRbcLoading(false);
        }
    }, [rbc.loading]);

    useEffect(() => {
        if (rbc.rbcData) {
            setRbcData(rbc.rbcData);
        }
    }, [rbc.rbcData]);

    return (
        <div className="product-performance-data">
            <div className="revenue-by-category-chart analytics-box">
                <div className="box-header">
                    <h2>Revenue by Category</h2>
                    <div className="chart-selection-btns">
                        <IconButton
                            onClick={() => {
                                setRbcLoading(true);
                                setRbcParams({
                                    ...rbcParams,
                                    chartType: "line",
                                });
                            }}
                        >
                            <SvgIcon
                                htmlColor={
                                    rbcParams.chartType === "line"
                                        ? "white"
                                        : undefined
                                }
                            >
                                <ShowChartSharpIcon />
                            </SvgIcon>
                        </IconButton>
                        <IconButton
                            onClick={() => {
                                setRbcLoading(true);
                                setRbcParams({
                                    ...rbcParams,
                                    chartType: "bar",
                                });
                            }}
                        >
                            <SvgIcon
                                htmlColor={
                                    rbcParams.chartType === "bar"
                                        ? "white"
                                        : undefined
                                }
                            >
                                <BarChartSharpIcon />
                            </SvgIcon>
                        </IconButton>
                    </div>
                </div>
                <div className="chart">
                    {rbcLoading && (
                        <div className="chart-loading">
                            <CircularProgress />
                        </div>
                    )}
                    {rbcData &&
                        rbcData.length > 0 &&
                        !rbcLoading &&
                        rbcParams.chartType === "line" && (
                            <CustomLineChart
                                data={rbcData as LineData[]}
                                idLegend={true}
                                enableSlices="x"
                                margin={{
                                    top: 10,
                                    right: mobile ? 40 : 100,
                                    bottom: mobile ? 100 : 46,
                                    left: mobile ? 60 : 70,
                                }}
                                yAxisFormat={(value: number) =>
                                    `${value.toLocaleString("en-US")}`
                                }
                                yFormat=">-,"
                            />
                        )}
                    {rbcData &&
                        rbcData.length > 0 &&
                        !rbcLoading &&
                        rbcParams.chartType === "bar" && (
                            <CustomBarChart
                                data={rbcData as BarData[]}
                                stacked={false}
                                includeLegend={false}
                                tiltLabels={true}
                                valueFormat=">-,"
                                margin={{
                                    top: 10,
                                    right: 60,
                                    bottom: 80,
                                    left: 100,
                                }}
                                yAxisFormat={(value: number) =>
                                    `${value.toLocaleString("en-US")}`
                                }
                            />
                        )}
                </div>
                <div className="box-footer">
                    <DateSelector
                        paramsObj={rbcParams}
                        setParams={setRbcParams}
                    />
                    <GranularitySelector<RBCParams, ExpandedGranularity>
                        paramsObj={rbcParams}
                        setParams={setRbcParams}
                        granularityOptions={rbcGranularityOptions}
                    />
                </div>
            </div>

            <div className="best-performing-products analytics-box">
                <TopProducts number="10" worst={false} />
            </div>
            <div className="worst-performing-products analytics-box">
                <TopProducts number="10" worst={true} />
            </div>
        </div>
    );
};
export default ProductPerformance;
