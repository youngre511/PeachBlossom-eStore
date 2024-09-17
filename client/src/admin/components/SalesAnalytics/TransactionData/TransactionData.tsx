import React, { useRef, useState } from "react";
import "./transaction-data.css";
import "../sales-analytics.css";
import { useEffect } from "react";
import { Button, IconButton, SvgIcon } from "@mui/material";
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
        setMobile(width && width >= 600 ? false : true);
    }, [width]);

    const analytics = useAppSelector((state: RootState) => state.analytics);

    const aov = analytics.averageOrderValue;
    const aovData = aov.aovData;
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
    const iptGranularityOptions: PlusGranularity[] = [
        "week",
        "month",
        "quarter",
        "year",
    ];
    const [iptGranMenuOpen, setIptGranMenuOpen] = useState<boolean>(false);
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

    useEffect(() => {
        console.log("totParams:", totParams);
        dispatch(
            fetchTransactionsOverTime({
                params: totParams,
            })
        );
    }, [totParams]);

    useEffect(() => {
        dispatch(
            fetchItemsPerTransaction({
                params: iptParams,
            })
        );
    }, [iptParams]);

    useEffect(() => {
        dispatch(
            fetchAverageOrderValue({
                params: aovParams,
            })
        );
    }, [aovParams]);

    return (
        <div className="transaction-data">
            <div className="analytics-box">
                <div className="box-header">
                    <h2>Number of Transactions</h2>
                    <div className="chart-selection-btns">
                        <IconButton
                            onClick={() =>
                                setTotParams({
                                    ...totParams,
                                    chartType: "line",
                                })
                            }
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
                            onClick={() =>
                                setTotParams({ ...totParams, chartType: "bar" })
                            }
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
                    {totData &&
                        !tot.loading &&
                        totParams.chartType === "line" && (
                            <CustomLineChart
                                data={totData as LineData[]}
                                idLegend={true}
                                enableSlices="x"
                                margin={{
                                    top: 10,
                                    right: mobile ? 40 : 100,
                                    bottom: mobile ? 100 : 80,
                                    left: mobile ? 60 : 100,
                                }}
                                yAxisFormat={(value: number) =>
                                    `${value.toLocaleString("en-US")}`
                                }
                                yFormat=">-,"
                            />
                        )}
                    {totData &&
                        !tot.loading &&
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
                        mobile={mobile}
                    />
                    <GranularitySelector<TOTParams, ExpandedGranularity>
                        paramsObj={totParams}
                        setParams={setTotParams}
                        granularityOptions={totGranularityOptions}
                        mobile={mobile}
                    />
                </div>
            </div>
            <div className="analytics-box">
                <div className="box-header">
                    <h2>Average Order Value</h2>
                    <div className="chart-selection-btns">
                        <IconButton
                            onClick={() =>
                                setAovParams({
                                    ...aovParams,
                                    chartType: "line",
                                })
                            }
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
                            onClick={() =>
                                setAovParams({ ...aovParams, chartType: "bar" })
                            }
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
                    {aovData &&
                        !aov.loading &&
                        aovParams.chartType === "line" && (
                            <CustomLineChart
                                data={aovData as LineData[]}
                                idLegend={true}
                                enableSlices="x"
                                margin={{
                                    top: 10,
                                    right: mobile ? 40 : 100,
                                    bottom: mobile ? 100 : 80,
                                    left: mobile ? 60 : 100,
                                }}
                                yAxisFormat={(value: number) =>
                                    `$${value.toLocaleString("en-US")}`
                                }
                                yFormat=">-$,.2f"
                            />
                        )}
                    {aovData &&
                        !aov.loading &&
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
                        mobile={mobile}
                    />
                    <GranularitySelector<AOVParams, BaseGranularity>
                        paramsObj={aovParams}
                        setParams={setAovParams}
                        granularityOptions={aovGranularityOptions}
                        mobile={mobile}
                    />
                </div>
            </div>
            <div className="analytics-box">
                <div className="box-header">
                    <h2>Average Items Per Transaction</h2>
                    <div className="chart-selection-btns">
                        <IconButton
                            onClick={() =>
                                setIptParams({
                                    ...iptParams,
                                    chartType: "line",
                                })
                            }
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
                            onClick={() =>
                                setIptParams({ ...iptParams, chartType: "bar" })
                            }
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
                <div className="chart">
                    {iptData &&
                        !ipt.loading &&
                        iptParams.chartType === "line" && (
                            <CustomLineChart
                                data={totData as LineData[]}
                                idLegend={true}
                                enableSlices="x"
                                margin={{
                                    top: 10,
                                    right: mobile ? 40 : 100,
                                    bottom: mobile ? 100 : 80,
                                    left: mobile ? 60 : 100,
                                }}
                                yAxisFormat={(value: number) =>
                                    `${value.toLocaleString("en-US")}`
                                }
                                yFormat=">-,"
                            />
                        )}
                    {iptData &&
                        !ipt.loading &&
                        iptParams.chartType === "bar" && (
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
                        paramsObj={iptParams}
                        setParams={setIptParams}
                        mobile={mobile}
                    />
                    <GranularitySelector<PlusParams, PlusGranularity>
                        paramsObj={iptParams}
                        setParams={setIptParams}
                        granularityOptions={iptGranularityOptions}
                        mobile={mobile}
                    />
                </div>
            </div>
        </div>
    );
};
export default TransactionData;
