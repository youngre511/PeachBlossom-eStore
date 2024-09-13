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
    dataFormat: { id: SortOrder; id2?: SortOrder; x: SortOrder; y: YValue }
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
        idk2: boolean
    ) => {
        // Make copies of ids
        let aId = a.id;
        let bId = b.id;
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
            // There is no second term and
            //    the id is not a number and aid comes earlier in the alphabet han bid
            //    OR
            //    the id is a number and aid is less than bid
            // OR
            // There is a second term and
            //    the first term of a is less than the first term of b
            //    AND
            //    the year of a is less than or equal to the first term of b
            // According to constructChart function code, if there is a second term, both first and second terms will always be numbers after being processed in the code above.
            if (!idk2) {
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

    //lineSort performs the same logic as dynamicSort but at the level of X within the data properties of each LineData object
    const lineSort = (rawData: LineChartData[], xk2: boolean) => {
        console.log("line sorting");
        const data = [...rawData];
        const sortedData = data.map((dataObj) => {
            const dataObjCopy = { ...dataObj };

            const dataObjXY = dataObjCopy.data;
            const sortedXY = dataObjXY.sort(
                (a: { x: string; y: number }, b: { x: string; y: number }) => {
                    let aX = a.x;
                    let bX = b.x;

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

                    if (!xk2) {
                        if (
                            (isNaN(Number(aX)) && aX < bX) ||
                            (!isNaN(Number(aX)) && Number(aX) - Number(bX) < 0)
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
        return sortedData;
    };

    const constructChart = () => {
        const result: any[] = [];

        const usedIds: string[] = [];
        const idKey = Object.keys(rawData[0]).filter((key) =>
            String(key).endsWith(dataFormat.id)
        )[0];
        const idKey2 = dataFormat.id2
            ? Object.keys(rawData[0]).filter((key) =>
                  String(key).endsWith(dataFormat.id2 as SortOrder)
              )[0]
            : null;
        const xKey = Object.keys(rawData[0]).filter((key) =>
            String(key).endsWith(dataFormat.x)
        )[0];

        const yKey = Object.keys(rawData[0]).filter((key) =>
            String(key).endsWith(dataFormat.y)
        )[0];
        let xKey2Exists: boolean = false;

        rawData.forEach((dataPoint: any) => {
            // Establish data values, converting month, if present, from number to abbr
            let idValue = dataPoint[idKey];

            if (dataFormat.id === "month" && typeof idValue === "number") {
                idValue = monthArr[idValue - 1];
            } else if (dataFormat.id === "quarter") {
                idValue = `Q${dataPoint[idKey]}`;
            }

            if (idKey2) idValue += ` ${dataPoint[idKey2]}`;

            let xValue = dataPoint[xKey];
            if (xKey === "month") {
                if (
                    idKey !== "year" &&
                    Object.keys(dataPoint).includes("year")
                ) {
                    xValue = `${monthArr[Number(dataPoint[xKey]) - 1]} ${
                        dataPoint["year"]
                    }`;
                    xKey2Exists = true;
                } else {
                    xValue = monthArr[Number(dataPoint[xKey]) - 1];
                }
            } else if (xKey === "quarter") {
                if (
                    idKey !== "year" &&
                    Object.keys(dataPoint).includes("year")
                ) {
                    xValue = `Q${dataPoint[xKey]} ${dataPoint["year"]}`;
                    xKey2Exists = true;
                } else {
                    xValue = `Q${dataPoint[xKey]}`;
                }
            } else if (xKey === "week") {
                xValue = `Week ${dataPoint[xKey] + 1}`;
            }
            xValue = String(xValue);
            let yValue = dataPoint[yKey];

            // Create objects in array if none exists for given id

            if (!usedIds.includes(idValue)) {
                usedIds.push(idValue);
                result.push(
                    chartType === "line"
                        ? { id: idValue, data: [] }
                        : { id: idValue }
                );
            }

            // Find the index of the object with an id of idValue

            const idIndex = result.findIndex((item) => item.id === idValue);

            // Construct data object and push to that objects data array
            if (chartType === "line") {
                const dataObject = { x: xValue, y: yValue };
                result[idIndex].data.push(dataObject);
            } else if (chartType === "bar") {
                result[idIndex][xValue] = Number(yValue);
            } else {
                // result[idIndex]["label"] = xValue;
                result[idIndex]["value"] = yValue;
            }
        });

        if (chartType === "line") {
            // Sort at level of id first and then at level of data (x)
            const sortedResult: LineChartData[] = lineSort(
                result.sort((a, b) =>
                    dynamicSort<LineChartData>(a, b, idKey2 ? true : false)
                ),
                xKey2Exists
            );

            return sortedResult;
        } else if (chartType === "bar") {
            const sortedResult: BarChartData[] = result.sort((a, b) =>
                dynamicSort<BarChartData>(a, b, idKey2 ? true : false)
            );

            return sortedResult;
        } else {
            const sortedResult: PieChartData[] = result.sort((a, b) =>
                dynamicSort<PieChartData>(a, b, idKey2 ? true : false)
            );

            return sortedResult;
        }
    };

    return constructChart();
};

export default buildChartObjects;
