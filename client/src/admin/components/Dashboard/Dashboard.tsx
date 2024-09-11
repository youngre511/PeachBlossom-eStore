import React from "react";
import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/store";
import { ResponsiveLine } from "@nivo/line";
import { fetchRevenueOverTime } from "../../features/Analytics/analyticsSlice";
import { ROTParams } from "../../features/Analytics/analyticsTypes";
import CustomLineChart from "../CustomCharts/CustomLineChart";
import CustomBarChart from "../CustomCharts/CustomBarChart";

const Dashboard: React.FC = () => {
    const dispatch = useAppDispatch();
    const analytics = useAppSelector((state: RootState) => state.analytics);
    const rotData = analytics.revenueOverTime.rotData;
    const [rotParams, setRotParams] = useState<ROTParams>({
        chartType: "line",
        granularity: "quarter",
        byRegion: true,
    });
    useEffect(() => {
        console.log("rotData:", rotData);
        if (rotData && rotData.length === 0) {
            console.log("length:", rotData.length);
            dispatch(fetchRevenueOverTime({ params: rotParams }));
        } else if (rotData) {
            console.log("rotData:", rotData);
        }
    }, [rotData]);
    return (
        <div className="dashboard-grid">
            <div
                style={{
                    width: "800px",
                    height: "600px",
                    backgroundColor: "white",
                }}
            >
                {rotData && (
                    <CustomLineChart
                        data={rotData}
                        xLegend="Month"
                        yLegend="Revenue"
                    />
                )}
                {/* {rotData && <CustomBarChart data={rotData} />} */}
            </div>
            <div className="sales-summary"></div>
        </div>
    );
};
export default Dashboard;
