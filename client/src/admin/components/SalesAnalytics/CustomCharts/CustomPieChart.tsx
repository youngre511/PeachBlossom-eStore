import { ResponsivePie } from "@nivo/pie";
import React, { useState } from "react";
import { useEffect } from "react";
import {
    PieData,
    PieDataArray,
} from "../../../features/Analytics/analyticsTypes";
import { nivoTheme } from "./chartThemes";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";
import { IconButton, SvgIcon } from "@mui/material";
import { ArrowLeftSharp, ArrowRightSharp } from "@mui/icons-material";
import ChartPeriodSelector from "./ChartPeriodSelector";

interface Props {
    data: PieDataArray;
    margin?: {
        top: number;
        right: number;
        bottom: number;
        left: number;
    };
    enableArcLinkLabels: boolean;
    enableLegend: boolean;
    innerRadius?: number;
}
const CustomPieChart: React.FC<Props> = ({
    data,
    margin,
    enableArcLinkLabels,
    enableLegend,
    innerRadius = 0,
}) => {
    const { width } = useWindowSizeContext();
    const [isNarrow, setIsNarrow] = useState<boolean>(true);
    const [currentIdx, setCurrentIdx] = useState<number>(0);

    useEffect(() => {
        if (data.length > 1) {
            setCurrentIdx(data.length - 1);
        } else {
            setCurrentIdx(0);
        }
    }, [data]);

    useEffect(() => {
        if (width && (width >= 800 || (width < 600 && width >= 475))) {
            if (isNarrow) {
                setIsNarrow(false);
            }
        } else if (!isNarrow) {
            setIsNarrow(true);
        }
    }, [width, setIsNarrow]);

    const checkAllZeros = (data: PieData) => {
        for (let datum of data) {
            if (String(datum.value) !== "0.00") return false;
        }
        return true;
    };

    return (
        <React.Fragment>
            {Array.isArray(data) && (
                <React.Fragment>
                    <div className="chart-period-selection-btns">
                        {data.length > 1 && currentIdx < data.length && (
                            <ChartPeriodSelector
                                currentIdx={currentIdx}
                                setCurrentIdx={setCurrentIdx}
                                maxIdx={data.length - 1}
                                text={data[currentIdx].period}
                            />
                        )}
                    </div>
                    {currentIdx < data.length && (
                        <div className="pie-chart">
                            {checkAllZeros(data[currentIdx].data) ? (
                                <div className="no-sales-data">
                                    No sales data for selected period.{" "}
                                </div>
                            ) : (
                                <ResponsivePie
                                    data={data[currentIdx].data}
                                    theme={nivoTheme}
                                    margin={
                                        margin || {
                                            top: 40,
                                            right: 80,
                                            bottom: 80,
                                            left: 80,
                                        }
                                    }
                                    valueFormat={(value) =>
                                        `${Number(value).toFixed(1)}%`
                                    }
                                    enableArcLinkLabels={!isNarrow}
                                    innerRadius={innerRadius}
                                    legends={
                                        isNarrow
                                            ? [
                                                  {
                                                      anchor: "bottom-right",
                                                      direction: "column",
                                                      justify: false,
                                                      translateX: 35,
                                                      translateY: 100,
                                                      itemsSpacing: 5,
                                                      itemWidth: 100,
                                                      itemHeight: 18,
                                                      itemTextColor: "#444",
                                                      itemDirection:
                                                          "left-to-right",
                                                      itemOpacity: 1,
                                                      symbolSize: 18,
                                                      symbolShape: "circle",
                                                      effects: [
                                                          {
                                                              on: "hover",
                                                              style: {
                                                                  itemTextColor:
                                                                      "#000",
                                                              },
                                                          },
                                                      ],
                                                  },
                                              ]
                                            : undefined
                                    }
                                />
                            )}
                        </div>
                    )}
                </React.Fragment>
            )}
        </React.Fragment>
    );
};
export default CustomPieChart;
