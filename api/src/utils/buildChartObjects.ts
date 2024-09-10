import { SortOrder, YValue } from "../services/analyticsService.js";
import { ChartType } from "../controllers/analyticsController.js";

interface idBase {
    id: string | number;
}

export type BarChartData = { id: string } & { [key: string]: number };

export type LineChartData = {
    id: string;
    data: Array<{ x: string; y: number }>;
};

export type PieChartData = {
    id: string;
    label: string;
    value: number;
};

const buildChartObjects = (
    rawData: any,
    chartType: ChartType,
    dataFormat: { id: SortOrder; x: SortOrder; y: YValue }
) => {
    const monthArr = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
    ];

    const dynamicSort = <R extends BarChartData | LineChartData | PieChartData>(
        a: R,
        b: R
    ) => {
        if (typeof a.id === "number" && typeof b.id === "number") {
            return (a.id as number) - (b.id as number);
        } else {
            if (a.id < b.id) {
                return -1;
            } else {
                return 1;
            }
        }
    };

    const constructChart = () => {
        const result: any[] = [];

        const usedIds: string[] = [];
        const idKey = Object.keys(rawData[0]).filter((key) =>
            String(key).endsWith(dataFormat.id)
        )[0];
        const xKey = Object.keys(rawData[0]).filter((key) =>
            String(key).endsWith(dataFormat.x)
        )[0];
        const yKey = Object.keys(rawData[0]).filter((key) =>
            String(key).endsWith(dataFormat.y)
        )[0];

        console.log(idKey, xKey, yKey);

        rawData.forEach((dataPoint: any) => {
            // Establish data values, converting month, if present, from number to abbr
            let idValue = dataPoint[idKey];
            if (idKey === "month" && typeof idValue === "number") {
                idValue = monthArr[idValue - 1];
            } else if (idKey === "quarter") {
                idValue = `Q${dataPoint[idKey]} / ${dataPoint["year"]}`;
            }

            let xValue = dataPoint[xKey];
            if (xKey === "month") {
                if (
                    idKey !== "year" &&
                    Object.keys(dataPoint).includes("year")
                ) {
                    xValue = `${monthArr[Number(dataPoint[xKey]) - 1]} ${
                        dataPoint["year"]
                    }`;
                } else {
                    xValue = monthArr[Number(dataPoint[xKey]) - 1];
                }
            } else if (xKey === "quarter") {
                if (
                    idKey !== "year" &&
                    Object.keys(dataPoint).includes("year")
                ) {
                    xValue = `Q${dataPoint[xKey]} / ${dataPoint["year"]}`;
                } else {
                    xValue = `Q${dataPoint[xKey]}`;
                }
            } else if (xKey === "week") {
                xValue = `Week ${dataPoint[xKey] + 1}`;
            }
            let yValue = dataPoint[yKey];
            console.log("still working");
            // Create objects in array if none exists for given id
            console.log(
                "usedIds:",
                usedIds,
                "dataPoint[idKey]:",
                dataPoint[idKey]
            );
            if (!usedIds.includes(dataPoint[idKey])) {
                usedIds.push(dataPoint[idKey]);
                result.push(
                    chartType === "line"
                        ? { id: idValue, data: [] }
                        : { id: idValue }
                );
            }

            // Find the index of the object with an id of idValue
            console.log("result:", result);
            const idIndex = result.findIndex((item) => item.id === idValue);
            console.log("idIndex:", idIndex);
            // Construct data object and push to that objects data array
            if (chartType === "line") {
                console.log("result[idIndex]", result[idIndex]);
                const dataObject = { x: xValue, y: yValue };
                result[idIndex].data.push(dataObject);
                console.log("constructing line");
                for (const object of result) {
                    if (xKey === "month") {
                        object.data = object.data.sort(
                            (
                                a: { x: string; y: number },
                                b: { x: string; y: number }
                            ) =>
                                monthArr.indexOf(a.x.split(" ")[0]) -
                                monthArr.indexOf(b.x.split(" ")[0])
                        );
                    } else {
                        object.data = object.data.sort(
                            (
                                a: { x: string; y: number },
                                b: { x: string; y: number }
                            ) => (a.x < b.x ? -1 : 1)
                        );
                    }
                }
            } else if (chartType === "bar") {
                result[idIndex][xValue] = Number(yValue);
            } else {
                result[idIndex]["label"] = xValue;
                result[idIndex]["value"] = yValue;
            }
        });

        if (chartType === "line") {
            const sortedResult: LineChartData[] = result.sort((a, b) =>
                dynamicSort<LineChartData>(a, b)
            );
            console.log("sortedResult:", sortedResult);
            return sortedResult;
        } else if (chartType === "bar") {
            const sortedResult: BarChartData[] = result.sort((a, b) =>
                dynamicSort<BarChartData>(a, b)
            );
            console.log("sortedResult:", sortedResult);
            return sortedResult;
        } else {
            const sortedResult: PieChartData[] = result.sort((a, b) =>
                dynamicSort<PieChartData>(a, b)
            );
            console.log("sortedResult:", sortedResult);
            return sortedResult;
        }
    };
    return constructChart();
};

export default buildChartObjects;
