import React, { useState } from "react";
import "../sales-analytics.css";
import "./revenue.css";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";
import { RootState } from "../../../store/store";
import {
    BarData,
    BaseGranularity,
    ExpandedGranularity,
    LineData,
    PieData,
    PlusGranularity,
    PlusParams,
    RRPParams,
} from "../../../features/Analytics/analyticsTypes";
import {
    fetchRegionPercentages,
    fetchRevenueByLocation,
    fetchRevenueOverTime,
} from "../../../features/Analytics/analyticsSlice";
import { CircularProgress, IconButton, SvgIcon } from "@mui/material";
import ShowChartSharpIcon from "@mui/icons-material/ShowChartSharp";
import BarChartSharpIcon from "@mui/icons-material/BarChartSharp";
import CustomLineChart from "../CustomCharts/CustomLineChart";
import CustomBarChart from "../CustomCharts/CustomBarChart";
import DateSelector from "../DateSelector";
import GranularitySelector from "../GranularitySelector";
import { ArrowLeftSharp, ArrowRightSharp } from "@mui/icons-material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import CustomPieChart from "../CustomCharts/CustomPieChart";
import StackedBarChartSharpIcon from "@mui/icons-material/StackedBarChartSharp";

interface Props {}
const Revenue: React.FC<Props> = () => {
    const dispatch = useAppDispatch();
    const { width } = useWindowSizeContext();
    const [mobile, setMobile] = useState<boolean>(true);

    useEffect(() => {
        setMobile(width && width >= 800 ? false : true);
    }, [width]);

    const analytics = useAppSelector((state: RootState) => state.analytics);

    const rot = analytics.revenueOverTime;
    const rotData = rot.rotData;
    // Maintain local state to track loading state.
    // Fixes problem of delay between chartType being changed in local params and redux slice loading state updating that was causing nivo charts to enter error state by attempting to render data of wrong type.
    const [rotLoading, setRotLoading] = useState<boolean>(true);
    const rotGranularityOptions: BaseGranularity[] = [
        "week",
        "month",
        "quarter",
    ];
    const [rotParams, setRotParams] = useState<PlusParams>({
        startDate: undefined,
        endDate: undefined,
        chartType: "line",
        granularity: "month",
    });

    useEffect(() => {
        dispatch(
            fetchRevenueOverTime({
                params: rotParams,
            })
        );
    }, [rotParams]);

    useEffect(() => {
        if (rot.loading) {
            setRotLoading(true);
        } else {
            setRotLoading(false);
        }
    }, [rot.loading]);

    const rp = analytics.regionPercentages;
    const rpData = rp.rpData;
    const rpGranularityOptions: ExpandedGranularity[] = [
        "month",
        "quarter",
        "year",
        "all",
    ];
    const [rpParams, setRpParams] = useState<RRPParams>({
        startDate: undefined,
        endDate: undefined,
        chartType: "pie",
        byRegion: true,
        granularity: "month",
    });

    useEffect(() => {
        dispatch(
            fetchRegionPercentages({
                params: rpParams,
            })
        );
    }, [rpParams]);

    const rbl = analytics.revenueByLocation;
    const rblData = rbl.rotData;
    const [rblStacked, setRblStacked] = useState<boolean>(true);
    const [rblLoading, setRblLoading] = useState<boolean>(true);
    const rblGranularityOptions: PlusGranularity[] = [
        "month",
        "quarter",
        "year",
    ];
    const [rblParams, setRblParams] = useState<PlusParams>({
        startDate: undefined,
        endDate: undefined,
        chartType: "bar",
        byRegion: true,
        granularity: "month",
    });

    useEffect(() => {
        dispatch(
            fetchRevenueByLocation({
                params: rblParams,
            })
        );
    }, [rblParams]);

    useEffect(() => {
        if (rbl.loading) {
            setRblLoading(true);
        } else {
            setRblLoading(false);
            console.log(rblData);
        }
    }, [rbl.loading]);

    return (
        <div className="revenue-analytics">
            <div className="revenue-chart analytics-box">
                <div className="box-header">
                    <h2>Revenue Year Over Year</h2>
                    <div className="chart-selection-btns">
                        <IconButton
                            onClick={() => {
                                setRotLoading(true);
                                setRotParams({
                                    ...rotParams,
                                    chartType: "line",
                                });
                            }}
                        >
                            <SvgIcon
                                htmlColor={
                                    rotParams.chartType === "line"
                                        ? "white"
                                        : undefined
                                }
                            >
                                <ShowChartSharpIcon />
                            </SvgIcon>
                        </IconButton>
                        <IconButton
                            onClick={() => {
                                setRotLoading(true);
                                setRotParams({
                                    ...rotParams,
                                    chartType: "bar",
                                });
                            }}
                        >
                            <SvgIcon
                                htmlColor={
                                    rotParams.chartType === "bar"
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
                    {rotLoading && (
                        <div className="chart-loading">
                            <CircularProgress />
                        </div>
                    )}
                    {rotData &&
                        !rotLoading &&
                        rotParams.chartType === "line" && (
                            <CustomLineChart
                                data={rotData as LineData[]}
                                idLegend={true}
                                enableSlices="x"
                                margin={{
                                    top: 10,
                                    right: mobile ? 40 : 100,
                                    bottom: mobile ? 100 : 46,
                                    left: mobile ? 70 : 70,
                                }}
                                yAxisFormat={(value: number) =>
                                    `$${value.toLocaleString("en-US")}`
                                }
                                yFormat=">-$,.2f"
                            />
                        )}
                    {rotData &&
                        !rotLoading &&
                        rotParams.chartType === "bar" && (
                            <CustomBarChart
                                data={rotData as BarData[]}
                                stacked={false}
                                includeLegend={false}
                                tiltLabels={true}
                                valueFormat=">-$,.2f"
                                margin={{
                                    top: 10,
                                    right: mobile ? 40 : 60,
                                    bottom: mobile ? 50 : 80,
                                    left: mobile ? 80 : 100,
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
                        paramsObj={rotParams}
                        setParams={setRotParams}
                    />
                    <GranularitySelector<PlusParams, PlusGranularity>
                        paramsObj={rotParams}
                        setParams={setRotParams}
                        granularityOptions={rotGranularityOptions}
                    />
                </div>
            </div>
            <div className="region-percent-chart analytics-box">
                <div className="box-header">
                    <h2>Regional Revenue Percentages</h2>
                </div>
                <div className="pie-chart-cont chart">
                    {rp.loading && (
                        <div className="chart-loading">
                            <CircularProgress />
                        </div>
                    )}
                    {rpData.length > 0 && !rp.loading && (
                        <CustomPieChart
                            data={rpData}
                            margin={{
                                top: 0,
                                right: mobile ? 40 : 100,
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
                        paramsObj={rpParams}
                        setParams={setRpParams}
                    />
                    <GranularitySelector<RRPParams, ExpandedGranularity>
                        paramsObj={rpParams}
                        setParams={setRpParams}
                        granularityOptions={rpGranularityOptions}
                    />
                </div>
            </div>
            <div className="revenue-chart analytics-box">
                <div className="box-header">
                    <h2>Revenue By Location</h2>
                    <div className="chart-selection-btns">
                        <IconButton
                            onClick={() => {
                                setRblStacked(false);
                            }}
                        >
                            <SvgIcon
                                htmlColor={!rblStacked ? "white" : undefined}
                            >
                                <BarChartSharpIcon />
                            </SvgIcon>
                        </IconButton>
                        <IconButton
                            onClick={() => {
                                setRblStacked(true);
                            }}
                        >
                            <SvgIcon
                                htmlColor={rblStacked ? "white" : undefined}
                            >
                                <StackedBarChartSharpIcon />
                            </SvgIcon>
                        </IconButton>
                    </div>
                </div>
                <div className="chart">
                    {rblLoading && (
                        <div className="chart-loading">
                            <CircularProgress />
                        </div>
                    )}
                    {rblData.length > 0 &&
                        !rblLoading &&
                        rblParams.chartType === "bar" && (
                            <CustomBarChart
                                data={rblData as BarData[]}
                                stacked={rblStacked}
                                includeLegend={true}
                                legendPosition={"bottom"}
                                tiltLabels={true}
                                valueFormat=">-$,.2f"
                                margin={{
                                    top: 10,
                                    right: mobile ? 40 : 60,
                                    bottom: mobile ? 80 : 85,
                                    left: mobile ? 80 : 100,
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
                        paramsObj={rblParams}
                        setParams={setRblParams}
                    />
                    <GranularitySelector<PlusParams, PlusGranularity>
                        paramsObj={rblParams}
                        setParams={setRblParams}
                        granularityOptions={rblGranularityOptions}
                    />
                </div>
            </div>
        </div>
    );
};
export default Revenue;
