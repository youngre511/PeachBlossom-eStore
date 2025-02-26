import { ChartType } from "../controllers/_controllerTypes.js";
import { SortOrder, YValue } from "../services/analyticsService.js";

interface idBase {
    id: string | number;
}

export type BarChartData = { id: string } & { [key: string]: number };

export type LineChartData = {
    id: string;
    data: Array<{ x: string; y: number }>;
};

export type PieChartData = {
    period: string;
    data: {
        id: string;
        label: string;
        value: number;
    }[];
};

const buildChartObjects = (
    rawData: any,
    chartType: ChartType,
    dataFormat: {
        id: SortOrder | null;
        id2?: SortOrder;
        x: SortOrder | "all" | null;
        y: YValue;
    },
    altTopValue?: string
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

    // Function to strip any prefixes added in id construction, and then break compound values (such as those in 'Quarter Year' format) into parsed objects to facilitate sort comparison
    const parseCompoundValues = (value: string) => {
        let year = 0,
            quarter = 0,
            week = 0,
            month = 0;

        if (value.includes("Q")) {
            const [q, y] = value.replace("Q", "").split(" ");
            year = Number(y);
            quarter = Number(q);
        } else if (value.includes("Week")) {
            const [_, w, y] = value.split(" ");
            year = Number(y);
            week = Number(w);
        } else {
            const [m, y] = value.split(" ");
            year = Number(y);
            month = Number(m);
        }

        return { year, quarter, week, month };
    };

    const dynamicSort = <R extends BarChartData | LineChartData | PieChartData>(
        a: R,
        b: R,
        idk2: boolean,
        pieChart?: boolean
    ) => {
        // Make copies of ids
        let aId = pieChart
            ? (a as PieChartData).period
            : (a as BarChartData | LineChartData).id;
        let bId = pieChart
            ? (b as PieChartData).period
            : (b as BarChartData | LineChartData).id;
        if (typeof aId === "number" && typeof bId === "number") {
            return (aId as number) - (bId as number);
        } else {
            // If aid and bid (which will always be of same type) are strings:
            // First, use monthArr to replace month names with their indexes

            for (let i = 0; i < monthArr.length; i++) {
                if (aId.includes(monthArr[i])) {
                    aId = aId.replace(monthArr[i], `${i}`);
                }
                if (bId.includes(monthArr[i])) {
                    bId = bId.replace(monthArr[i], `${i}`);
                }
            }

            // Strip any prefixes added in id construction, and then
            // create split versions of ids to be used in the case that there is a second id term
            const aParsed = parseCompoundValues(aId);
            const bParsed = parseCompoundValues(bId);

            // Keep a before b if:
            // There is no second term, chartType is not "pie", and
            //    the id is not a number and aid comes earlier in the alphabet han bid
            //    OR
            //    the id is a number and aid is less than bid
            // OR
            // There is a second term or chartType is "pie" and
            //    the first term of a is less than the first term of b
            //    AND
            //    the year of a is less than or equal to the first term of b
            // According to constructChart function code, if there is a second term, both first and second terms will always be numbers after being processed in the code above.
            if (!idk2 && chartType !== "pie") {
                if (
                    (isNaN(Number(aId)) && aId < bId) ||
                    (!isNaN(Number(aId)) && Number(aId) - Number(bId) < 0)
                ) {
                    return -1;
                } else {
                    return 1;
                }
            } else {
                if (aParsed.year !== bParsed.year) {
                    return aParsed.year - bParsed.year;
                } else if (aParsed.quarter !== bParsed.quarter) {
                    return aParsed.quarter - bParsed.quarter;
                } else if (aParsed.month !== bParsed.month) {
                    return aParsed.month - bParsed.month;
                } else if (aParsed.week !== bParsed.week) {
                    return aParsed.week - bParsed.week;
                }
            }
            return 0;
        }
    };

    // secondarySort performs the same logic as dynamicSort but at the level of X within the data properties of each LineData object or at the level of id (né "x") within the data properties of each PieChart object
    // secondarySort requires a generic type and returns data as that type
    const secondarySort = <T extends LineChartData[] | PieChartData[]>(
        rawData: T,
        xk2: boolean
    ) => {
        const data = [...rawData];
        const sortedData = data.map((dataObj) => {
            const dataObjCopy = { ...dataObj };

            const dataObjXY = dataObjCopy.data;
            const sortedXY = dataObjXY.sort(
                (
                    a: { x: string; y: number } | { id: string; value: number },
                    b: { x: string; y: number } | { id: string; value: number }
                ) => {
                    // determines which type a and b are by checking for presence of "x" key and then uses type assertions to tell typescript the result
                    let aX = Object.keys(a).includes("x")
                        ? (a as { x: string; y: number }).x
                        : (a as { id: string; value: number }).id;
                    let bX = Object.keys(b).includes("x")
                        ? (b as { x: string; y: number }).x
                        : (b as { id: string; value: number }).id;

                    for (let i = 0; i < monthArr.length; i++) {
                        if (aX.includes(monthArr[i])) {
                            aX = aX.replace(monthArr[i], `${i}`);
                        }
                        if (bX.includes(monthArr[i])) {
                            bX = bX.replace(monthArr[i], `${i}`);
                        }
                    }

                    const aParsed = parseCompoundValues(aX);
                    const bParsed = parseCompoundValues(bX);

                    const aXstripped = aX.replace("Week ", "").replace("Q", "");
                    const bXstripped = bX.replace("Week ", "").replace("Q", "");

                    if (!xk2) {
                        if (
                            (isNaN(Number(aXstripped)) && aX < bX) ||
                            (!isNaN(Number(aXstripped)) &&
                                Number(aXstripped) - Number(bXstripped) < 0)
                        ) {
                            return -1;
                        } else {
                            return 1;
                        }
                    } else {
                        if (aParsed.year !== bParsed.year) {
                            return aParsed.year - bParsed.year;
                        } else if (aParsed.quarter !== bParsed.quarter) {
                            return aParsed.quarter - bParsed.quarter;
                        } else if (aParsed.month !== bParsed.month) {
                            return aParsed.month - bParsed.month;
                        } else if (aParsed.week !== bParsed.week) {
                            return aParsed.week - bParsed.week;
                        }
                    }
                    return 0;
                }
            );

            dataObjCopy.data = sortedXY;
            return dataObjCopy;
        });

        return sortedData as T;
    };

    const constructChart = () => {
        const result: any[] = [];

        const usedIds: string[] = [];
        const idKey = !dataFormat.id
            ? null
            : Object.keys(rawData[0]).filter((key) =>
                  String(key).endsWith(dataFormat.id!)
              )[0];
        const idKey2 = dataFormat.id2
            ? Object.keys(rawData[0]).filter((key) =>
                  String(key).endsWith(dataFormat.id2 as SortOrder)
              )[0]
            : null;
        const xKey = !dataFormat.x
            ? null
            : Object.keys(rawData[0]).filter((key) =>
                  String(key).endsWith(dataFormat.x as string)
              )[0];

        const yKey = Object.keys(rawData[0]).filter((key) =>
            String(key).endsWith(dataFormat.y)
        )[0];
        let xKey2Exists: boolean = false;

        rawData.forEach((dataPoint: any) => {
            // Establish data values, converting month, if present, from number to abbr
            let idValue = !idKey ? altTopValue : dataPoint[idKey];

            if (dataFormat.id === "month" && typeof idValue === "number") {
                idValue = monthArr[idValue - 1];
            } else if (dataFormat.id === "quarter") {
                idValue = `Q${dataPoint[idKey!]}`;
            }

            if (idKey2) idValue += ` ${dataPoint[idKey2]}`;

            let xValue;
            if (!xKey) {
                xValue = altTopValue;
            } else {
                xValue = dataPoint[xKey];
            }

            // Ensure that neither id nor x end up being null
            xValue = xValue ?? "Unknown";
            idValue = idValue ?? "N/A";

            const yearKey =
                Object.keys(rawData[0]).filter((key) =>
                    String(key).endsWith("year")
                )[0] || null;
            if (xKey && dataFormat.x === "month") {
                if (dataFormat.id !== "year" && yearKey) {
                    xValue = `${monthArr[Number(dataPoint[xKey]) - 1]} ${
                        dataPoint[yearKey]
                    }`;
                    xKey2Exists = true;
                } else {
                    xValue = monthArr[Number(dataPoint[xKey]) - 1];
                }
            } else if (xKey && dataFormat.x === "quarter") {
                if (dataFormat.id !== "year" && yearKey) {
                    xValue = `Q${dataPoint[xKey]} ${dataPoint[yearKey]}`;
                    xKey2Exists = true;
                } else {
                    xValue = `Q${dataPoint[xKey]}`;
                }
            } else if (xKey && dataFormat.x === "week") {
                xValue = `Week ${dataPoint[xKey] + 1}`;
            }

            xValue = String(xValue);
            let yValue = dataPoint[yKey];

            // Create objects in array if none exists for given id
            if (chartType === "pie") {
                if (!usedIds.includes(xValue)) {
                    usedIds.push(xValue);
                    result.push({ period: xValue, data: [] });
                }
            } else if (!usedIds.includes(idValue)) {
                usedIds.push(idValue);
                result.push(
                    chartType === "line"
                        ? { id: idValue, data: [] }
                        : { id: idValue }
                );
            }

            // Find the index of the object with an id of idValue

            let idIndex: number = -1;

            if (chartType === "pie") {
                idIndex = result.findIndex((item) => item.period === xValue);
            } else {
                idIndex = result.findIndex((item) => item.id === idValue);
            }

            // Construct data object and push to that objects data array
            if (idIndex === -1) {
                throw new Error("Error creating result object");
            } else if (chartType === "line") {
                const dataObject = { x: xValue, y: yValue };
                result[idIndex].data.push(dataObject);
            } else if (chartType === "bar") {
                result[idIndex][xValue] = Number(yValue);
            } else {
                // result[idIndex]["label"] = xValue;
                result[idIndex].data.push({ id: idValue, value: yValue });
            }
        });

        if (chartType === "line") {
            // Sort at level of id first and then at level of data (x)
            const sortedResult: LineChartData[] = secondarySort<
                LineChartData[]
            >(
                result.sort((a, b) =>
                    dynamicSort<LineChartData>(a, b, idKey2 ? true : false)
                ),
                xKey2Exists
            ) as LineChartData[];

            return sortedResult;
        } else if (chartType === "bar") {
            const sortedResult: BarChartData[] = result.sort((a, b) =>
                dynamicSort<BarChartData>(a, b, idKey2 ? true : false)
            );
            return sortedResult;
        } else {
            // return result;
            const sortedResult: PieChartData[] = secondarySort<PieChartData[]>(
                result.sort((a, b) =>
                    dynamicSort<PieChartData>(a, b, !!idKey2, true)
                ),
                !!idKey2
            ) as PieChartData[];

            return sortedResult;
        }
    };

    return constructChart();
};

export default buildChartObjects;
