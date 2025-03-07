import { ResponsiveBar } from "@nivo/bar";
import React, { useState } from "react";
import keySort from "../../../utils/keySort";
import { useEffect } from "react";
import { nivoTheme } from "./chartThemes";
import ChartPeriodSelector from "../ChartComponents/ChartPeriodSelector";
import { BarData } from "../../../features/Analytics/analyticsTypes";

interface Props {
    data: BarData[];
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
    itemsSpacing?: number;
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
    itemsSpacing,
}) => {
    const [viewByYear, setViewByYear] = useState<boolean>(false);
    const [currentIdx, setCurrentIdx] = useState<number>(0);
    const [loading, setLoading] = useState<boolean>(true);
    const [numberAcross, setNumberAcross] = useState<number | null>(null);
    const [dataArray, setDataArray] = useState<
        Array<{ period: string; data: BarData[] }>
    >([]);
    const [maxValue, setMaxValue] = useState<number | "auto">("auto");
    const [stackedMaxValue, setStackedMaxValue] = useState<number | "auto">(
        "auto"
    );
    // Create a list of keys minus "id" and sort
    const keys = Object.keys(data[0]);
    keys.splice(keys.indexOf("id"), 1);
    const sortedKeys = keySort(keys);

    useEffect(() => {
        if (dataArray.length > 1) {
            setCurrentIdx(dataArray.length - 1);
        } else {
            setCurrentIdx(0);
        }
    }, [dataArray]);

    useEffect(() => {
        let number: number = data.length;
        if (!stacked) {
            number = number * sortedKeys.length;
        }
        setNumberAcross(number);
    }, [data.length]);

    // Transforms data to data array of type Array<{period: string, data: BarData[]}> to support viewing data by year when there is too much data to display all at once.
    useEffect(() => {
        if (numberAcross) {
            if (numberAcross < 20) {
                setViewByYear(false);
                setDataArray([{ period: "all", data: data }]);
                setLoading(false);
            } else {
                const newDataArray: Array<{ period: string; data: BarData[] }> =
                    [];
                // Max tracks the maximum value in dataset. It is used to set the maxValue of the chart when viewing data by period to avoid major layout shifts.
                let max: number = 0;
                let stackedMax: number = 0;
                setViewByYear(true);
                data.forEach((dataPoint) => {
                    const pointCopy = { ...dataPoint };
                    const year = pointCopy.id.split(" ")[1];
                    pointCopy.id = pointCopy.id.split(" ")[0];
                    const periodIndex = newDataArray.findIndex(
                        (item) => item.period === year
                    );
                    if (periodIndex === -1) {
                        newDataArray.push({ period: year, data: [pointCopy] });
                    } else {
                        newDataArray[periodIndex].data.push(pointCopy);
                    }
                    // Calculate the max value of any unstacked bar across all data
                    sortedKeys.forEach((key) => {
                        if (dataPoint[key] > max) {
                            max = dataPoint[key];
                        }
                    });
                });

                // Determine the maximum value of any stacked bar by calculating the total value for each month in each year
                newDataArray.forEach((yearDatum) => {
                    let total: number = 0;
                    yearDatum.data.forEach((monthDatum) => {
                        let monthTotal: number = 0;
                        Object.keys(monthDatum).forEach((key) => {
                            if (key !== "id") {
                                monthTotal = monthTotal + monthDatum[key];
                            }
                        });
                        if (monthTotal > total) {
                            total = monthTotal;
                        }
                    });
                    if (total > stackedMax) {
                        stackedMax = total;
                    }
                });

                newDataArray.sort(
                    (
                        a: { period: string; data: any },
                        b: { period: string; data: any }
                    ) => Number(a.period) - Number(b.period)
                );

                // Pad the data in the final item of the year-by-year array with empty (zero) data matching the same format to avoid major layout shifts caused by differing numbers of ids.
                const array1 = newDataArray[0].data;
                const arrayLast = newDataArray[newDataArray.length - 1].data;
                if (arrayLast.length < array1.length) {
                    const array1Copy = [...array1];
                    const blankObj: Record<string, number> = {};
                    sortedKeys.forEach((key) => (blankObj[key] = 0));
                    array1Copy.splice(0, arrayLast.length);
                    array1Copy.forEach((item) => {
                        newDataArray[newDataArray.length - 1].data.push({
                            ...blankObj,
                            id: item.id,
                        } as BarData);
                    });
                }
                setDataArray(newDataArray);
                setMaxValue(max);
                setStackedMaxValue(stackedMax);
                setLoading(false);
            }
        }
    }, [numberAcross]);

    return (
        <React.Fragment>
            <div className="chart-period-selection-btns">
                {viewByYear && (
                    <ChartPeriodSelector
                        currentIdx={currentIdx}
                        setCurrentIdx={setCurrentIdx}
                        maxIdx={dataArray.length - 1}
                        text={dataArray[currentIdx].period}
                    />
                )}
            </div>
            {!loading && dataArray.length > 0 && (
                <ResponsiveBar
                    data={dataArray[currentIdx].data}
                    keys={sortedKeys}
                    theme={nivoTheme}
                    maxValue={
                        stacked ? stackedMaxValue || "auto" : maxValue || "auto"
                    }
                    margin={
                        margin || { top: 50, right: 150, bottom: 80, left: 100 }
                    }
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
                                      translateX:
                                          legendPosition === "bottom" ? 0 : 120,
                                      translateY:
                                          legendPosition === "bottom" ? 85 : 0,
                                      itemsSpacing: itemsSpacing || 2,
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
            )}
        </React.Fragment>
    );
};
export default CustomBarChart;
