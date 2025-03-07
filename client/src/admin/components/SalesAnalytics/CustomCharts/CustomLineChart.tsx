import React, { useState } from "react";
import { useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import { nivoTheme } from "./chartThemes";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";

interface Props {
    data: { id: string | number; data: { x: string; y: number }[] }[];
    xLegend?: string;
    yLegend?: string;
    idLegend?: boolean;
    margin?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    enableSlices?: "x" | "y";
    yAxisFormat?: (value: number) => string;
    yFormat?: string;
}

const CustomLineChart: React.FC<Props> = ({
    data,
    xLegend,
    yLegend,
    idLegend = true,
    margin,
    enableSlices,
    yAxisFormat,
    yFormat,
}) => {
    const { width } = useWindowSizeContext();
    const [mobile, setMobile] = useState<boolean>(true);
    const xValues = data[0].data.map((point) => point.x);
    const skipValues =
        xValues.length > 0
            ? xValues[0].startsWith("Week") ||
              (mobile && !xValues[0].startsWith("Q"))
            : false;

    useEffect(() => {
        if (width) {
            setMobile(width < 800);
        }
    }, [width]);

    return (
        <ResponsiveLine
            data={data as any}
            theme={nivoTheme}
            animate={false}
            axisBottom={{
                legend: xLegend,
                legendOffset: 60,
                tickRotation: 45,
                tickValues: skipValues
                    ? xValues.filter((_, index) => index % 3 === 0)
                    : undefined,
            }}
            axisLeft={{
                legend: yLegend,
                legendOffset: -80,
                format: yAxisFormat,
            }}
            pointSize={8}
            enableTouchCrosshair={true}
            margin={margin || { top: 50, right: 110, bottom: 80, left: 100 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", stacked: false }}
            yFormat={yFormat}
            useMesh={true}
            enableSlices={enableSlices || false}
            legends={
                idLegend
                    ? [
                          {
                              anchor: mobile ? "bottom" : "bottom-right",
                              direction: mobile ? "row" : "column",
                              justify: false,
                              translateX: mobile ? 0 : 100,
                              translateY: mobile ? 90 : 0,
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
