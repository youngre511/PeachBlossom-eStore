import { ResponsiveBar } from "@nivo/bar";
import React from "react";
import keySort from "../../../utils/keySort";
import { useEffect } from "react";
import { nivoTheme } from "./chartThemes";

interface Props {
    data: any[];
    stacked: boolean;
    margin?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    includeLegend: boolean;
    tiltLabels?: boolean;
    valueFormat?: string;
    yAxisFormat?: (value: number) => string;
    enableLabel?: boolean;
    legendPosition?: "bottom" | "bottom-right";
}
const CustomBarChart: React.FC<Props> = ({
    data,
    stacked,
    margin,
    includeLegend,
    valueFormat,
    tiltLabels = false,
    yAxisFormat,
    enableLabel = true,
    legendPosition = "bottom-right",
}) => {
    // Create a list of keys minus "id" and sort
    const keys = Object.keys(data[0]);
    keys.splice(keys.indexOf("id"), 1);
    const sortedKeys = keySort(keys);

    return (
        <ResponsiveBar
            data={data}
            keys={sortedKeys}
            theme={nivoTheme}
            margin={margin || { top: 50, right: 150, bottom: 80, left: 100 }}
            groupMode={stacked ? "stacked" : "grouped"}
            valueFormat={valueFormat}
            axisBottom={tiltLabels ? { tickRotation: 45 } : undefined}
            axisLeft={{ format: yAxisFormat }}
            enableLabel={enableLabel}
            legends={
                includeLegend
                    ? [
                          {
                              dataFrom: "keys",
                              anchor: legendPosition,
                              direction:
                                  legendPosition === "bottom"
                                      ? "row"
                                      : "column",
                              justify: false,
                              translateX: legendPosition === "bottom" ? 0 : 120,
                              translateY: legendPosition === "bottom" ? 85 : 0,
                              itemsSpacing: 2,
                              itemWidth: 100,
                              itemHeight: 20,
                              itemDirection: "left-to-right",
                              itemOpacity: 0.85,
                              symbolSize: 20,
                              effects: [
                                  {
                                      on: "hover",
                                      style: {
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
export default CustomBarChart;
