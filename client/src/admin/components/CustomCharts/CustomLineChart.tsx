import React from "react";
import { useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import { nivoTheme } from "./chartThemes";

interface Props {
    data: { id: string | number; data: { x: string; y: number }[] }[];
    xLegend: string;
    yLegend: string;
    idLegend?: boolean;
    margin?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
}
const CustomLineChart: React.FC<Props> = ({
    data,
    xLegend,
    yLegend,
    idLegend = true,
    margin,
}) => {
    return (
        <ResponsiveLine
            data={data as any}
            theme={nivoTheme}
            axisBottom={{
                legend: xLegend,
                legendOffset: 60,
                tickRotation: 45,
            }}
            axisLeft={{
                legend: yLegend,
                legendOffset: -80,
                format: (value) => `$${value.toLocaleString("en-US")}`,
            }}
            margin={margin || { top: 50, right: 110, bottom: 80, left: 100 }}
            yScale={{ type: "linear", stacked: true }}
            yFormat=">-$,.2f"
            enableSlices="x"
            legends={
                idLegend
                    ? [
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
                      ]
                    : undefined
            }
        />
    );
};
export default CustomLineChart;
