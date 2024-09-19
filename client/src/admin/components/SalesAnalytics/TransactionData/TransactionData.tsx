import React, { useRef, useState } from "react";
import "./transaction-data.css";
import "../sales-analytics.css";
import { useEffect } from "react";
import { Button, CircularProgress, IconButton, SvgIcon } from "@mui/material";
import BarChartSharpIcon from "@mui/icons-material/BarChartSharp";
import ShowChartSharpIcon from "@mui/icons-material/ShowChartSharp";
import DateRangeSharpIcon from "@mui/icons-material/DateRangeSharp";
import CustomBarChart from "../CustomCharts/CustomBarChart";
import CustomLineChart from "../CustomCharts/CustomLineChart";
import {
    AOVParams,
    BarData,
    BaseGranularity,
    ExpandedGranularity,
    LineData,
    PlusGranularity,
    PlusParams,
    TOTParams,
} from "../../../features/Analytics/analyticsTypes";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { RootState } from "../../../store/store";
import {
    fetchAverageOrderValue,
    fetchItemsPerTransaction,
    fetchTransactionsOverTime,
} from "../../../features/Analytics/analyticsSlice";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";
import GranularitySelector from "../GranularitySelector";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import DateSelector from "../DateSelector";

interface Props {}
const TransactionData: React.FC<Props> = () => {
    const dispatch = useAppDispatch();
    const { width } = useWindowSizeContext();
    const [mobile, setMobile] = useState<boolean>(true);

    useEffect(() => {
        setMobile(width && width >= 800 ? false : true);
    }, [width]);

    const analytics = useAppSelector((state: RootState) => state.analytics);

    const aov = analytics.averageOrderValue;
    const aovData = aov.aovData;
    // Maintain local state to track loading state.
    // Fixes problem of delay between chartType being changed in local params and redux slice loading state updating that was causing nivo charts to enter error state by attempting to render data of wrong type.
    const [aovLoading, setAovLoading] = useState<boolean>(true);
    const aovGranularityOptions: BaseGranularity[] = [
        "week",
        "month",
        "quarter",
    ];
    const [aovParams, setAovParams] = useState<AOVParams>(
        aov.aovParams || {
            startDate: undefined,
            endDate: undefined,
            chartType: "line",
            granularity: "month",
        }
    );

    const ipt = analytics.itemsPerTransaction;
    const iptData = ipt.iptData;
    const [iptLoading, setIptLoading] = useState<boolean>(true);
    const iptGranularityOptions: PlusGranularity[] = [
        "week",
        "month",
        "quarter",
        "year",
    ];
    const [iptParams, setIptParams] = useState<PlusParams>(
        ipt.iptParams || {
            startDate: undefined,
            endDate: undefined,
            chartType: "line",
            granularity: "month",
        }
    );

    const tot = analytics.transactionsOverTime;
    const totData = tot.totData;
    const [totLoading, setTotLoading] = useState<boolean>(true);
    const totGranularityOptions: ExpandedGranularity[] = [
        "week",
        "month",
        "quarter",
        "year",
    ];
    const [totParams, setTotParams] = useState<TOTParams>(
        tot.totParams || {
            startDate: undefined,
            endDate: undefined,
            chartType: "line",
            granularity: "month",
        }
    );

    // Use effects to dispatch fetch request when params change and update local loading state when slice loading state changes.
    useEffect(() => {
        dispatch(
            fetchTransactionsOverTime({
                params: totParams,
            })
        );
    }, [totParams]);

    useEffect(() => {
        if (!tot.loading) {
            setTotLoading(false);
        } else {
            setTotLoading(true);
        }
    }, [tot.loading]);

    useEffect(() => {
        dispatch(
            fetchItemsPerTransaction({
                params: iptParams,
            })
        );
    }, [iptParams]);

    useEffect(() => {
        if (!ipt.loading) {
            setIptLoading(false);
        } else {
            setIptLoading(true);
        }
    }, [ipt.loading]);

    useEffect(() => {
        dispatch(
            fetchAverageOrderValue({
                params: aovParams,
            })
        );
    }, [aovParams]);

    useEffect(() => {
        if (!aov.loading) {
            setAovLoading(false);
        } else {
            setAovLoading(true);
        }
    }, [aov.loading]);

    return (
        <div className="transaction-data">
            <div className="transaction-chart analytics-box">
                <div className="box-header">
                    <h2>Number of Transactions</h2>
                    <div className="chart-selection-btns">
                        <IconButton
                            onClick={() => {
                                setTotLoading(true);
                                setTotParams({
                                    ...totParams,
                                    chartType: "line",
                                });
                            }}
                        >
                            <SvgIcon
                                htmlColor={
                                    totParams.chartType === "line"
                                        ? "white"
                                        : undefined
                                }
                            >
                                <ShowChartSharpIcon />
                            </SvgIcon>
                        </IconButton>
                        <IconButton
                            onClick={() => {
                                setTotLoading(true);
                                setTotParams({
                                    ...totParams,
                                    chartType: "bar",
                                });
                            }}
                        >
                            <SvgIcon
                                htmlColor={
                                    totParams.chartType === "bar"
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
                    {totLoading && (
                        <div className="chart-loading">
                            <CircularProgress />
                        </div>
                    )}
                    {totData.length > 0 &&
                        !totLoading &&
                        totParams.chartType === "line" && (
                            <CustomLineChart
                                data={totData as LineData[]}
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
                    {totData.length > 0 &&
                        !totLoading &&
                        totParams.chartType === "bar" && (
                            <CustomBarChart
                                data={totData as BarData[]}
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
                        paramsObj={totParams}
                        setParams={setTotParams}
                    />
                    <GranularitySelector<TOTParams, ExpandedGranularity>
                        paramsObj={totParams}
                        setParams={setTotParams}
                        granularityOptions={totGranularityOptions}
                    />
                </div>
            </div>
            <div className="transaction-chart analytics-box">
                <div className="box-header">
                    <h2>Average Order Value</h2>
                    <div className="chart-selection-btns">
                        <IconButton
                            onClick={() => {
                                setAovLoading(true);
                                setAovParams({
                                    ...aovParams,
                                    chartType: "line",
                                });
                            }}
                        >
                            <SvgIcon
                                htmlColor={
                                    aovParams.chartType === "line"
                                        ? "white"
                                        : undefined
                                }
                            >
                                <ShowChartSharpIcon />
                            </SvgIcon>
                        </IconButton>
                        <IconButton
                            onClick={() => {
                                setAovLoading(true);
                                setAovParams({
                                    ...aovParams,
                                    chartType: "bar",
                                });
                            }}
                        >
                            <SvgIcon
                                htmlColor={
                                    aovParams.chartType === "bar"
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
                    {aovLoading && (
                        <div className="chart-loading">
                            <CircularProgress />
                        </div>
                    )}
                    {aovData.length > 0 &&
                        !aovLoading &&
                        aovParams.chartType === "line" && (
                            <CustomLineChart
                                data={aovData as LineData[]}
                                idLegend={true}
                                enableSlices="x"
                                margin={{
                                    top: 10,
                                    right: mobile ? 40 : 100,
                                    bottom: mobile ? 100 : 46,
                                    left: mobile ? 60 : 70,
                                }}
                                yAxisFormat={(value: number) =>
                                    `$${value.toLocaleString("en-US")}`
                                }
                                yFormat=">-$,.2f"
                            />
                        )}
                    {aovData.length > 0 &&
                        !aovLoading &&
                        aovParams.chartType === "bar" && (
                            <CustomBarChart
                                data={aovData as BarData[]}
                                stacked={false}
                                includeLegend={false}
                                tiltLabels={true}
                                valueFormat=">-$,.2f"
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
                <div className="box-footer">
                    <DateSelector
                        paramsObj={aovParams}
                        setParams={setAovParams}
                    />
                    <GranularitySelector<AOVParams, BaseGranularity>
                        paramsObj={aovParams}
                        setParams={setAovParams}
                        granularityOptions={aovGranularityOptions}
                    />
                </div>
            </div>
            <div className="transaction-chart analytics-box">
                <div className="box-header">
                    <h2>Average Items Per Transaction</h2>
                    <div className="chart-selection-btns">
                        <IconButton
                            onClick={() => {
                                setIptLoading(true);
                                setIptParams({
                                    ...iptParams,
                                    chartType: "line",
                                });
                            }}
                        >
                            <SvgIcon
                                htmlColor={
                                    iptParams.chartType === "line"
                                        ? "white"
                                        : undefined
                                }
                            >
                                <ShowChartSharpIcon />
                            </SvgIcon>
                        </IconButton>
                        <IconButton
                            onClick={() => {
                                setIptLoading(true);
                                setIptParams({
                                    ...iptParams,
                                    chartType: "bar",
                                });
                            }}
                        >
                            <SvgIcon
                                htmlColor={
                                    iptParams.chartType === "bar"
                                        ? "white"
                                        : undefined
                                }
                            >
                                <BarChartSharpIcon />
                            </SvgIcon>
                        </IconButton>
                    </div>
                </div>
                <div className="chart-cont">
                    <div className="chart">
                        {iptLoading && (
                            <div className="chart-loading">
                                <CircularProgress />
                            </div>
                        )}
                        {iptData.length > 0 &&
                            !iptLoading &&
                            iptParams.chartType === "line" && (
                                <CustomLineChart
                                    data={iptData as LineData[]}
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
                        {iptData.length > 0 &&
                            !iptLoading &&
                            iptParams.chartType === "bar" && (
                                <CustomBarChart
                                    data={iptData as BarData[]}
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
                </div>
                <div className="box-footer">
                    <DateSelector
                        paramsObj={iptParams}
                        setParams={setIptParams}
                    />
                    <GranularitySelector<PlusParams, PlusGranularity>
                        paramsObj={iptParams}
                        setParams={setIptParams}
                        granularityOptions={iptGranularityOptions}
                    />
                </div>
            </div>
        </div>
    );
};
export default TransactionData;
