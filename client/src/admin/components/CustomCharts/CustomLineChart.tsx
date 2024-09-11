import React from "react";
import { useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";

interface Props {
    data: any[];
    xLegend: string;
    yLegend: string;
}
const CustomLineChart: React.FC<Props> = ({ data, xLegend, yLegend }) => {
    return (
        <ResponsiveLine
            data={data}
            axisBottom={{
                legend: "Month",
                legendOffset: 60,
                tickRotation: 45,
            }}
            axisLeft={{
                legend: "Revenue (in dollars)",
                legendOffset: -80,
                format: (value) => `$${value.toLocaleString("en-US")}`,
            }}
            margin={{ top: 50, right: 110, bottom: 80, left: 100 }}
            yScale={{ type: "linear", stacked: true }}
            yFormat=">-$,.2f"
            enableSlices="x"
            legends={[
                {
                    anchor: "bottom-right",
                    direction: "column",
                    justify: false,
                    translateX: 100,
                    translateY: 0,
                    itemsSpacing: 0,
                    itemDirection: "left-to-right",
                    itemWidth: 80,
                    itemHeight: 20,
                    itemOpacity: 0.75,
                    symbolSize: 12,
                    symbolShape: "circle",
                    symbolBorderColor: "rgba(0, 0, 0, .5)",
                    effects: [
                        {
                            on: "hover",
                            style: {
                                itemBackground: "rgba(0, 0, 0, .03)",
                                itemOpacity: 1,
                            },
                        },
                    ],
                },
            ]}
        />
    );
};
export default CustomLineChart;
