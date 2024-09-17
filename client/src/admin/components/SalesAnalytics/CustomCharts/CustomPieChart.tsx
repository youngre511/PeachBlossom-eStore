import { ResponsivePie } from "@nivo/pie";
import React from "react";
import { useEffect } from "react";
import { PieData } from "../../../features/Analytics/analyticsTypes";
import { nivoTheme } from "./chartThemes";

interface Props {
    data: PieData;
    margin?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}
const CustomPieChart: React.FC<Props> = ({ data, margin }) => {
    const chartData = data[1];
    console.log(chartData);
    return (
        <React.Fragment>
            {Array.isArray(chartData) && (
                <ResponsivePie
                    data={chartData}
                    theme={nivoTheme}
                    margin={
                        margin || { top: 40, right: 80, bottom: 80, left: 80 }
                    }
                    valueFormat={(value) => `${Number(value).toFixed(1)}%`}
                />
            )}
        </React.Fragment>
    );
};
export default CustomPieChart;
