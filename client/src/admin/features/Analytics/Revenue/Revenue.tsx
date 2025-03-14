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
    PlusGranularity,
    PlusParams,
    RRPParams,
} from "../analyticsTypes";
import {
    fetchRegionPercentages,
    fetchRevenueByLocation,
    fetchRevenueOverTime,
} from "../analyticsSlice";
import CustomLineChart from "../components/CustomCharts/CustomLineChart";
import CustomBarChart from "../components/CustomCharts/CustomBarChart";
import CustomPieChart from "../components/CustomCharts/CustomPieChart";
import ChartFrame from "../components/ChartComponents/ChartFrame";

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
        }
    }, [rbl.loading]);

    return (
        <div className="revenue-analytics">
            <ChartFrame<PlusParams, PlusGranularity>
                className="revenue-chart"
                title="Revenue Year Over Year"
                allowedTypes={["line", "bar"]}
                loading={rotLoading}
                setLoading={setRotLoading}
                params={rotParams}
                setParams={setRotParams}
                granularityOptions={rotGranularityOptions}
            >
                {rotData && (
                    <React.Fragment>
                        {rotParams.chartType === "line" && (
                            <CustomLineChart
                                data={rotData as LineData[]}
                                idLegend={true}
                                xLegend="Month"
                                yLegend="Revenue"
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
                        {rotParams.chartType === "bar" && (
                            <CustomBarChart
                                data={rotData as BarData[]}
                                stacked={false}
                                includeLegend={false}
                                tiltLabels={true}
                                valueFormat=">-$,.2f"
                                margin={{
                                    top: 10,
                                    right: mobile ? 40 : 60,
                                    bottom: 80,
                                    left: mobile ? 80 : 100,
                                }}
                                yAxisFormat={(value: number) =>
                                    `$${value.toLocaleString("en-US")}`
                                }
                                enableLabel={false}
                            />
                        )}
                    </React.Fragment>
                )}
            </ChartFrame>
            <ChartFrame<RRPParams, ExpandedGranularity>
                className="region-percent-chart"
                title="Regional Revenue Percentages"
                allowedTypes={["pie"]}
                loading={rp.loading}
                params={rpParams}
                setParams={setRpParams}
                granularityOptions={rpGranularityOptions}
            >
                {rpData.length > 0 && (
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
            </ChartFrame>
            <ChartFrame<PlusParams, PlusGranularity>
                className="revenue-chart"
                title="Revenue By Location"
                allowedTypes={["bar"]}
                loading={rblLoading}
                setLoading={setRblLoading}
                params={rblParams}
                setParams={setRblParams}
                stacked={rblStacked}
                setStacked={setRblStacked}
                granularityOptions={rblGranularityOptions}
            >
                {rblData.length > 0 && (
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
            </ChartFrame>
        </div>
    );
};
export default Revenue;
