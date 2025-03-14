import React, { useState } from "react";
import "./transaction-data.css";
import "../sales-analytics.css";
import { useEffect } from "react";
import {
    AOVParams,
    BarData,
    BaseGranularity,
    ExpandedGranularity,
    LineData,
    PlusGranularity,
    PlusParams,
    TOTParams,
} from "../analyticsTypes";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { RootState } from "../../../store/store";
import {
    fetchAverageOrderValue,
    fetchItemsPerTransaction,
    fetchTransactionsOverTime,
} from "../analyticsSlice";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";
import CustomLineChart from "../components/CustomCharts/CustomLineChart";
import CustomBarChart from "../components/CustomCharts/CustomBarChart";
import ChartFrame from "../components/ChartComponents/ChartFrame";

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
            <ChartFrame<TOTParams, ExpandedGranularity>
                className="transaction-chart"
                title="Number of Transactions"
                allowedTypes={["line", "bar"]}
                loading={totLoading}
                setLoading={setTotLoading}
                params={totParams}
                setParams={setTotParams}
                granularityOptions={totGranularityOptions}
            >
                {totData.length > 0 && (
                    <React.Fragment>
                        {totParams.chartType === "line" && (
                            <CustomLineChart
                                data={totData as LineData[]}
                                idLegend={totData.length > 1}
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
                        {totParams.chartType === "bar" && (
                            <CustomBarChart
                                data={totData as BarData[]}
                                stacked={false}
                                includeLegend={false}
                                tiltLabels={true}
                                valueFormat=">-,"
                                margin={{
                                    top: 10,
                                    right: mobile ? 25 : 60,
                                    bottom: mobile ? 100 : 90,
                                    left: mobile ? 40 : 60,
                                }}
                                yAxisFormat={(value: number) =>
                                    `${value.toLocaleString("en-US")}`
                                }
                            />
                        )}
                    </React.Fragment>
                )}
            </ChartFrame>
            <ChartFrame<AOVParams, BaseGranularity>
                className="transaction-chart"
                title="Average Order Value"
                allowedTypes={["line", "bar"]}
                loading={aovLoading}
                setLoading={setAovLoading}
                params={aovParams}
                setParams={setAovParams}
                granularityOptions={aovGranularityOptions}
            >
                {aovData.length > 0 && (
                    <React.Fragment>
                        {aovParams.chartType === "line" && (
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
                        {aovParams.chartType === "bar" && (
                            <CustomBarChart
                                data={aovData as BarData[]}
                                stacked={false}
                                enableLabel={
                                    width && width > 1100 ? true : false
                                }
                                includeLegend={false}
                                tiltLabels={true}
                                valueFormat=">-$,.2f"
                                margin={{
                                    top: 10,
                                    right: mobile ? 25 : 60,
                                    bottom: mobile ? 100 : 90,
                                    left: mobile ? 50 : 60,
                                }}
                                yAxisFormat={(value: number) =>
                                    `$${value.toLocaleString("en-US")}`
                                }
                            />
                        )}
                    </React.Fragment>
                )}
            </ChartFrame>
            <ChartFrame<PlusParams, PlusGranularity>
                className="transaction-chart"
                title="Average Items Per Transaction"
                allowedTypes={["line", "bar"]}
                loading={iptLoading}
                setLoading={setIptLoading}
                params={iptParams}
                setParams={setIptParams}
                granularityOptions={iptGranularityOptions}
            >
                {iptData.length > 0 && (
                    <React.Fragment>
                        {iptParams.chartType === "line" && (
                            <CustomLineChart
                                data={iptData as LineData[]}
                                idLegend={iptData.length > 1}
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
                        {iptParams.chartType === "bar" && (
                            <CustomBarChart
                                data={iptData as BarData[]}
                                stacked={false}
                                includeLegend={false}
                                tiltLabels={true}
                                enableLabel={
                                    width && width > 800 ? true : false
                                }
                                valueFormat=">-,"
                                margin={{
                                    top: 10,
                                    right: mobile ? 25 : 60,
                                    bottom: mobile ? 100 : 90,
                                    left: mobile ? 40 : 60,
                                }}
                                yAxisFormat={(value: number) =>
                                    `${value.toLocaleString("en-US")}`
                                }
                            />
                        )}
                    </React.Fragment>
                )}
            </ChartFrame>
        </div>
    );
};
export default TransactionData;
