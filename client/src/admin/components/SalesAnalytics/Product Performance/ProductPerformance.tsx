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
    Period,
    PieDataArray,
    RBCParams,
    TopParams,
} from "../../../features/Analytics/analyticsTypes";
import {
    fetchCategoryPercentages,
    fetchRevenueByCategory,
} from "../../../features/Analytics/analyticsSlice";
import { CircularProgress, IconButton, SvgIcon } from "@mui/material";
import ShowChartSharpIcon from "@mui/icons-material/ShowChartSharp";
import BarChartSharpIcon from "@mui/icons-material/BarChartSharp";
import CustomLineChart from "../CustomCharts/CustomLineChart";
import CustomBarChart from "../CustomCharts/CustomBarChart";
import DateSelector from "../DateSelector";
import GranularitySelector from "../GranularitySelector";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";
import CustomPieChart from "../CustomCharts/CustomPieChart";
import PeriodSelector from "../PeriodSelector";

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
    const rbcBarGranularityOptions: ExpandedGranularity[] = [
        "month",
        "quarter",
        "year",
        "all",
    ];
    const rbcLineGranularityOptions: ExpandedGranularity[] = [
        "month",
        "quarter",
    ];
    const [rbcParams, setRbcParams] = useState<RBCParams>({
        startDate: undefined,
        endDate: undefined,
        chartType: "line",
        granularity: "month",
    });

    useEffect(() => {
        if (
            rbcParams.chartType === "line" &&
            !rbcLineGranularityOptions.includes(rbcParams.granularity)
        ) {
            setRbcParams({ ...rbcParams, granularity: "quarter" });
            dispatch(
                fetchRevenueByCategory({
                    params: { ...rbcParams, granularity: "quarter" },
                })
            );
        } else {
            dispatch(
                fetchRevenueByCategory({
                    params: rbcParams,
                })
            );
        }
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

    const [cpData, setCpData] = useState<PieDataArray>([]);

    const cp = analytics.categoryPercentages;
    const [cpLoading, setCpLoading] = useState<boolean>(true);
    const cpGranularityOptions: ExpandedGranularity[] = [
        "month",
        "quarter",
        "year",
        "all",
    ];
    const [cpParams, setCpParams] = useState<RBCParams>({
        startDate: undefined,
        endDate: undefined,
        chartType: "pie",
        granularity: "month",
        returnPercentage: true,
    });

    useEffect(() => {
        dispatch(
            fetchCategoryPercentages({
                params: cpParams,
            })
        );
    }, [cpParams]);

    useEffect(() => {
        if (cp.loading) {
            setCpLoading(true);
        } else {
            setCpLoading(false);
        }
    }, [cp.loading]);

    useEffect(() => {
        if (cp.rbcData) {
            setCpData(cp.rbcData);
        }
    }, [cp.rbcData]);

    const topPeriodOptions = ["7d", "30d", "6m", "1y", "all time"];

    const [bestParams, setBestParams] = useState<TopParams>({
        period: "30d",
    });
    const [worstParams, setWorstParams] = useState<TopParams>({
        period: "30d",
    });

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
                                idLegend={!mobile}
                                enableSlices="x"
                                margin={{
                                    top: 10,
                                    right: mobile ? 40 : 160,
                                    bottom: 50,
                                    left: 70,
                                }}
                                yAxisFormat={(value: number) =>
                                    `$${value.toLocaleString("en-US")}`
                                }
                                yFormat=">-$,.2f"
                            />
                        )}
                    {rbcData &&
                        rbcData.length > 0 &&
                        !rbcLoading &&
                        rbcParams.chartType === "bar" && (
                            <CustomBarChart
                                data={rbcData as BarData[]}
                                stacked={false}
                                includeLegend={!mobile}
                                tiltLabels={
                                    mobile && rbcParams.granularity === "all"
                                }
                                legendPosition="bottom-right"
                                valueFormat=">-$,.2f"
                                margin={{
                                    top: 10,
                                    right: mobile ? 40 : 180,
                                    bottom:
                                        mobile &&
                                        rbcParams.granularity === "all"
                                            ? 120
                                            : 80,
                                    left: 100,
                                }}
                                yAxisFormat={(value: number) =>
                                    `$${value.toLocaleString("en-US")}`
                                }
                                enableLabel={false}
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
                        granularityOptions={
                            rbcParams.chartType === "bar"
                                ? rbcBarGranularityOptions
                                : rbcLineGranularityOptions
                        }
                    />
                </div>
            </div>
            <div className="revenue-by-category-chart analytics-box">
                <div className="box-header">
                    <h2>Category Revenue Percentages</h2>
                </div>
                <div className="pie-chart-cont chart">
                    {cpLoading && (
                        <div className="chart-loading">
                            <CircularProgress />
                        </div>
                    )}
                    {cpData && cpData.length > 0 && !cpLoading && (
                        <CustomPieChart
                            data={cpData}
                            margin={{
                                top: 20,
                                right: mobile ? 80 : 100,
                                bottom: mobile ? 110 : 30,
                                left: mobile ? 40 : 100,
                            }}
                            enableArcLinkLabels={mobile ? false : true}
                            enableLegend={mobile ? true : false}
                            innerRadius={0.5}
                        />
                    )}
                </div>
                <div className="box-footer">
                    <DateSelector
                        paramsObj={cpParams}
                        setParams={setCpParams}
                    />
                    <GranularitySelector<RBCParams, ExpandedGranularity>
                        paramsObj={cpParams}
                        setParams={setCpParams}
                        granularityOptions={cpGranularityOptions}
                    />
                </div>
            </div>

            <div className="best-performing-products analytics-box">
                <TopProducts
                    number="10"
                    worst={false}
                    period={bestParams.period}
                />
                <div className="box-footer">
                    <PeriodSelector<TopParams>
                        paramsObj={bestParams}
                        setParams={setBestParams}
                        periodOptions={topPeriodOptions}
                    />
                </div>
            </div>
            <div className="worst-performing-products analytics-box">
                <TopProducts
                    number="10"
                    worst={true}
                    period={worstParams.period}
                />
                <div className="box-footer">
                    <PeriodSelector<TopParams>
                        paramsObj={worstParams}
                        setParams={setWorstParams}
                        periodOptions={topPeriodOptions}
                    />
                </div>
            </div>
        </div>
    );
};
export default ProductPerformance;
