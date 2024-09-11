import sequelize from "../models/mysql/index.js";
import { sqlOrder } from "../models/mysql/sqlOrderModel.js";
import { sqlOrderItem } from "../models/mysql/sqlOrderItemModel.js";
import { sqlAddress } from "../models/mysql/sqlAddressModel.js";
import { sqlProduct } from "../models/mysql/sqlProductModel.js";
import { sqlCategory } from "../models/mysql/sqlCategoryModel.js";
import { sqlSubcategory } from "../models/mysql/sqlSubcategoryModel.js";
import {
    Op,
    FindAttributeOptions,
    fn,
    literal,
    col,
    WhereOptions,
    IncludeOptions,
    GroupOption,
    Order,
} from "sequelize";
import { ChartType } from "../controllers/analyticsController.js";
import buildChartObjects, {
    BarChartData,
    LineChartData,
    PieChartData,
} from "../utils/buildChartObjects.js";

// Set up region case statement for creating region column in sql queries.
type RegionMap = {
    [key: string]: string[];
};

const regions: RegionMap = {
    Northeast: [
        "CT",
        "ME",
        "MA",
        "NH",
        "RI",
        "VT",
        "NJ",
        "NY",
        "PA",
        "DE",
        "MD",
    ],
    Southeast: [
        "AL",
        "AR",
        "FL",
        "GA",
        "KY",
        "LA",
        "MS",
        "NC",
        "SC",
        "TN",
        "VA",
        "WV",
    ],
    Midwest: [
        "IL",
        "IN",
        "IA",
        "MI",
        "MN",
        "MO",
        "NE",
        "ND",
        "SD",
        "OH",
        "WI",
        "KS",
    ],
    Southwest: ["AZ", "NM", "OK", "TX"],
    West: ["AK", "CA", "CO", "HI", "ID", "MT", "NV", "OR", "UT", "WA", "WY"],
};

const buildRegionCase = () => {
    let caseStatement = "CASE";

    for (const region in regions) {
        const states = regions[region].map((state) => `'${state}'`).join(", ");
        caseStatement += ` WHEN stateAbbr IN (${states}) THEN '${region}'`;
    }

    caseStatement += " ELSE 'Unknown' END";

    return caseStatement;
};

const regionCaseStatement = buildRegionCase();

// SortOrder type must allow all granularity types except "all"
export type SortOrder =
    | "region"
    | "stateAbbr"
    | "year"
    | "quarter"
    | "month"
    | "week"
    | "categoryName"
    | "subcategoryName";

export type YValue =
    | "count"
    | "total_revenue"
    | "averageOrderValue"
    | "averageQuantityPerOrder"
    | "percentage_of_total";

// Data Processing

// Function to transform raw, flattened sql responses into nested, two-index data arrays. Accepts raw data and an array of sort parameters (result keys) of type SortOrder.
// Each step transforms data into the following format: [sort parameter data, raw data minus sort parameter data].
// E.g. groupOrder ["year", "month"] would return
// dynamicSort function sorts data in ascending order at each step.
const buildNestedDataArrays = (groupOrder: SortOrder[], rawData: any) => {
    let nestedDataArray = [];

    const dynamicSort = (a: any[], b: any[]) => {
        if (typeof a[0] === "number" && typeof b[0] === "number") {
            return (a[0] as number) - (b[0] as number);
        } else {
            if (a[0] < b[0]) {
                return -1;
            } else {
                return 1;
            }
        }
    };

    const nestByType = (data: any, sortType: string) => {
        const nestedData: Array<any> = [];
        const key = Object.keys(data[0]).filter((key) =>
            String(key).endsWith(sortType)
        )[0];

        if (key) {
            for (const item of data) {
                const foundIndex = nestedData.findIndex(
                    (arrayItem) => arrayItem[0] === item[key]
                );
                if (foundIndex === -1) {
                    nestedData.push([item[key], [item]]);
                } else {
                    nestedData[foundIndex][1].push(item);
                }
            }
        } else {
            console.error("Unable to find key for", sortType);
        }
        return nestedData.sort(dynamicSort);
    };

    let sortTypeLength = groupOrder.length;

    const nested1 = nestByType(rawData, groupOrder[0]);

    // Logic includes a series of ternaries to add up to 5 levels of nesting.
    if (sortTypeLength > 1) {
        const nested2 = nested1.map((item) => [
            item[0],
            sortTypeLength === 2
                ? nestByType(item[1], groupOrder[1])
                : nestByType(item[1], groupOrder[1]).map((item1) => [
                      item1[0],
                      sortTypeLength === 3
                          ? nestByType(item1[1], groupOrder[2])
                          : nestByType(item1[1], groupOrder[2]).map((item2) => [
                                item2[0],
                                sortTypeLength === 4
                                    ? nestByType(item2[1], groupOrder[3])
                                    : nestByType(item2[1], groupOrder[3]).map(
                                          (item3) => [
                                              item3[0],
                                              sortTypeLength === 5
                                                  ? nestByType(
                                                        item3[1],
                                                        groupOrder[4]
                                                    )
                                                  : nestByType(
                                                        item3[1],
                                                        groupOrder[4]
                                                    ).map((item4) => [
                                                        item4[0],
                                                        nestByType(
                                                            item4[1],
                                                            groupOrder[5]
                                                        ),
                                                    ]),
                                          ]
                                      ),
                            ]),
                  ]),
        ]);
        nestedDataArray = nested2;
    } else {
        nestedDataArray = nested1;
    }
    return nestedDataArray;
};

// Get Revenue (by region?, by state?)

export const getRevenueOverTime = async (
    granularity: "week" | "month" | "quarter" | "year",
    startDate: string | null,
    endDate: string | null,
    byState: boolean = false,
    byRegion: boolean = false,
    chartType: ChartType
) => {
    try {
        // Dynamically construct attributes based on granularity input
        const attributeClause: FindAttributeOptions = [
            [fn("YEAR", col("orderDate")), "year"],
        ];
        switch (granularity) {
            case "year":
                break;
            case "quarter":
                attributeClause.push([
                    literal("QUARTER(orderDate)"),
                    "quarter",
                ]);
                break;
            case "month":
                attributeClause.push([fn("MONTH", col("orderDate")), "month"]);
                break;
            case "week":
                attributeClause.push([fn("WEEK", col("orderDate")), "week"]);
                break;
            default:
                throw new Error("invalid time grouping");
        }

        // Add sum data to attributes
        attributeClause.push([fn("SUM", col("subTotal")), "total_revenue"]);

        // Dynamically add date restrictions based on input

        let whereClause: WhereOptions | undefined = {};
        if (startDate && endDate) {
            whereClause["orderDate"] = {
                [Op.between]: [startDate, endDate],
            };
        } else if (startDate && !endDate) {
            whereClause["orderDate"] = {
                [Op.gte]: startDate,
            };
        } else if (endDate) {
            whereClause["orderDate"] = {
                [Op.lte]: endDate,
            };
        } else {
            whereClause = undefined;
        }

        // Dynamically create include parameter if sorting by state or region

        let includeClause: IncludeOptions[] | undefined = undefined;
        if (byState || byRegion) {
            includeClause = [
                {
                    model: sqlAddress,
                    as: "Address",
                    attributes: [
                        byState
                            ? "stateAbbr"
                            : [literal(regionCaseStatement), "region"],
                    ],
                },
            ];
        }

        // Dynamically create group clause and order clause

        const dataFormat = { y: "total_revenue" } as {
            id: SortOrder;
            x: SortOrder;
            y: YValue;
        };
        const groupClause: GroupOption = [];
        if (byRegion) {
            // Since sequelize does not support grouping or ordering by dynamically created fields in associated tables, in order to group/order by region, the RAW sql that created the column must be repeated in the group/order clause.
            groupClause.push(literal(regionCaseStatement));
            dataFormat["id"] = "region";
        } else if (byState) {
            groupClause.push("stateAbbr");
            dataFormat["id"] = "stateAbbr";
        } else {
            dataFormat["id"] = "year";
        }

        groupClause.push("year");
        if (["week", "month", "quarter"].includes(granularity)) {
            groupClause.push(`${granularity}`);
            // SortOrder type must allow all granularity types except "all"
            dataFormat["x"] = granularity as SortOrder;
        }

        const results = await sqlOrder.findAll({
            where: whereClause,
            attributes: attributeClause,
            include: includeClause,
            group: groupClause,
            order: ["total_revenue"],
            raw: true,
        });
        const processedResults = buildChartObjects(
            results,
            chartType,
            dataFormat
        );
        return processedResults;
    } catch (error) {
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error(
                "Error getting revenue over time: " + error.message
            );
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error(
                "An unknown error occurred while getting revenue over time"
            );
        }
    }
};

// Get Revenue by category/subcategory (by region? by state?)

export const getRevenueByCategory = async (
    granularity: "week" | "month" | "quarter" | "year" | "all",
    startDate: string | null,
    endDate: string | null,
    stateAbbr: string | null,
    region: string | null,
    bySubcategory: boolean = false,
    returnPercentage: boolean = false,
    chartType: ChartType
) => {
    try {
        // Dynamically construct order attributes based on granularity input
        let orderAttributeClause: FindAttributeOptions = ["orderDate"];
        switch (granularity) {
            case "all":
                break;
            case "year":
                orderAttributeClause.push([
                    fn("YEAR", col("orderDate")),
                    "year",
                ]);
                break;
            case "quarter":
                orderAttributeClause.push([
                    literal("QUARTER(orderDate)"),
                    "quarter",
                ]);
                orderAttributeClause.push([
                    fn("YEAR", col("orderDate")),
                    "year",
                ]);
                break;
            case "month":
                orderAttributeClause.push([
                    fn("MONTH", col("orderDate")),
                    "month",
                ]);
                orderAttributeClause.push([
                    fn("YEAR", col("orderDate")),
                    "year",
                ]);
                break;
            case "week":
                orderAttributeClause.push([
                    fn("WEEK", col("orderDate")),
                    "week",
                ]);
                orderAttributeClause.push([
                    fn("YEAR", col("orderDate")),
                    "year",
                ]);
                break;
            default:
                throw new Error("invalid time grouping");
        }

        // Dynamically add date restrictions based on input

        let orderWhereClause: WhereOptions | undefined = {};
        if (startDate && endDate) {
            orderWhereClause["orderDate"] = {
                [Op.between]: [startDate, endDate],
            };
        } else if (startDate && !endDate) {
            orderWhereClause["orderDate"] = {
                [Op.gte]: startDate,
            };
        } else if (endDate) {
            orderWhereClause["orderDate"] = {
                [Op.lte]: endDate,
            };
        } else {
            orderWhereClause = undefined;
        }

        // Dynamically create order include parameter if sorting by state or region

        let orderIncludeClause: IncludeOptions[] = [];
        if (stateAbbr || region) {
            orderIncludeClause.push({
                model: sqlAddress,
                as: "Address",
                attributes: ["stateAbbr"],
                where: stateAbbr
                    ? { stateAbbr: stateAbbr }
                    : sequelize.where(literal(regionCaseStatement), region),
            });
        }

        // Dynamically create order item include parameter if sorting by state or region
        const includeClause: IncludeOptions[] = [
            {
                model: sqlProduct,
                as: "Product",
                attributes: [],
                include: [
                    {
                        model: sqlCategory,
                        as: "Category",
                        attributes: ["categoryName"],
                    },
                    {
                        model: sqlSubcategory,
                        as: "Subcategory",
                        attributes: ["subcategoryName"],
                    },
                ],
            },
            {
                model: sqlOrder,
                as: "Order",
                attributes: orderAttributeClause,
                where: orderWhereClause,
                include: orderIncludeClause,
            },
        ];

        // Dynamically create data format

        const dataFormat = {
            y: returnPercentage ? "percentage_of_total" : "total_revenue",
        } as {
            id: SortOrder;
            id2?: SortOrder;
            x: SortOrder;
            y: YValue;
        };

        if (chartType === "pie") {
            if (bySubcategory) {
                dataFormat.id = "subcategoryName";
                dataFormat.x = "subcategoryName";
            } else {
                dataFormat.id = "categoryName";
                dataFormat.x = "categoryName";
            }
        } else {
            if (granularity === "year") {
                dataFormat.id = "year";
            } else if (["week", "month", "quarter"].includes(granularity)) {
                // SortOrder type must allow all granularity types except "all"
                dataFormat.id = granularity as SortOrder;
                dataFormat.id2 = "year";
            }

            if (bySubcategory) {
                dataFormat.x = "subcategoryName";
            } else {
                dataFormat.x = "categoryName";
            }
        }

        // Dynamically create group clause
        const groupClause: GroupOption = [];
        const periodName: string[] = [];
        const periodGroupClause: GroupOption = [];
        if (!returnPercentage) {
            if (bySubcategory) {
                groupClause.push("subcategoryName");
            } else {
                groupClause.push("categoryName");
            }
        }

        if (["week", "month", "quarter", "year"].includes(granularity)) {
            periodName.push("YEAR(orderDate)");
            periodGroupClause.push(literal("YEAR(orderDate)"));
            groupClause.push(literal("YEAR(orderDate)"));
        }
        if (["week", "month", "quarter"].includes(granularity)) {
            periodName.push(`'-${granularity.toUpperCase().substring(0, 1)}'`);
            periodName.push(`${granularity.toUpperCase()}(orderDate)`);
            periodGroupClause.push(
                literal(`${granularity.toUpperCase()}(orderDate)`)
            );
            groupClause.push(
                literal(`${granularity.toUpperCase()}(orderDate)`)
            );
        }

        if (returnPercentage) {
            if (bySubcategory) {
                groupClause.push("subcategoryName");
            } else {
                groupClause.push("categoryName");
            }
        }

        const totalRevenueByPeriod = await sqlOrderItem.findAll({
            attributes: [
                [literal(`SUM(quantity * priceWhenOrdered)`), "total_revenue"],
                periodGroupClause && [
                    literal(`CONCAT(${periodName.join(", ")})`),
                    "period",
                ],
            ],
            include: [
                {
                    model: sqlOrder,
                    as: "Order",
                    attributes: [],
                    where: orderWhereClause,
                },
            ],
            group: periodGroupClause,
            raw: true,
        });

        const totalRevenueMap: Record<string, number> = {};
        totalRevenueByPeriod.forEach((entry: any) => {
            const periodKey = entry.period || "all";
            totalRevenueMap[periodKey] = entry.total_revenue;
        });

        const results = await sqlOrderItem.findAll({
            attributes: [
                [
                    fn("SUM", literal("quantity * priceWhenOrdered")),
                    "total_revenue",
                ],
                periodGroupClause && [
                    literal(`CONCAT(${periodName.join(", ")})`),
                    "period",
                ],
            ],
            include: includeClause,
            group: groupClause,
            order: ["total_revenue"],
            raw: true,
        });

        const resultsWithPercentage = results.map((result: any) => {
            const periodKey = result.period; // Get the period from the SQL result
            const totalRevenueForPeriod = totalRevenueMap[periodKey] || 1; // Use the map, or default to 1
            const percentageOfTotal =
                (result.total_revenue / totalRevenueForPeriod) * 100;

            return {
                ...result,
                percentage_of_total: percentageOfTotal.toFixed(2), // Round to 2 decimal places
            };
        });

        // Package results to return to front end
        type FormattedResultsType = Array<
            | LineChartData
            | BarChartData
            | PieChartData
            | Array<string | PieChartData[]>
        >;

        let formattedResults: FormattedResultsType = [];

        // Pie charts necessarily can only consist of category/subcategory names and their associated values.
        // To return results for multiple periods, one pie-chart dataset must be returned for each period.
        // The code in if-block manages such cases by first using buildNestedDataArrays to sort by ascending period and then creating a pie-chart dataset for each.
        if (chartType === "pie" && granularity !== "all") {
            const sortedResults = buildNestedDataArrays(
                ["year", `${granularity}`],
                resultsWithPercentage
            );
            for (const year of sortedResults) {
                for (const gran of year[1]) {
                    const result = gran[1];
                    let dateId = "";
                    if (granularity === "week") {
                        dateId += `Week ${result[0]["Order.week"]} `;
                    }
                    if (granularity === "month") {
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
                        dateId += `${monthArr[result[0]["Order.month"] - 1]} `;
                    }
                    if (granularity === "quarter") {
                        dateId += `Q${result[0]["Order.quarter"]} `;
                    }
                    dateId += result[0]["Order.year"];
                    formattedResults.push([
                        dateId,
                        buildChartObjects(
                            result,
                            "pie",
                            dataFormat
                        ) as PieChartData[],
                    ]);
                }
            }
        } else {
            formattedResults = buildChartObjects(
                resultsWithPercentage,
                chartType,
                dataFormat
            );
        }

        const returnObject: Record<string, string | FormattedResultsType> = {
            results: formattedResults,
        };
        if (stateAbbr) {
            returnObject["state"] = stateAbbr;
        }
        if (region) {
            returnObject["region"] = region;
        }

        return returnObject;
    } catch (error) {
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error(
                "Error getting revenue by category: " + error.message
            );
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error(
                "An unknown error occurred while getting revenue by category"
            );
        }
    }
};

// Get number transactions

export const getTransactionsOverTime = async (
    granularity: "week" | "month" | "quarter" | "year" | "all",
    startDate: string | null,
    endDate: string | null,
    byState: boolean = false,
    byRegion: boolean = false,
    chartType: ChartType
) => {
    try {
        // Dynamically construct attributes based on granularity input
        const attributeClause: FindAttributeOptions = [];
        switch (granularity) {
            case "all":
                break;
            case "year":
                attributeClause.push([fn("YEAR", col("orderDate")), "year"]);
                break;
            case "quarter":
                attributeClause.push([
                    literal("QUARTER(orderDate)"),
                    "quarter",
                ]);
                attributeClause.push([fn("YEAR", col("orderDate")), "year"]);
                break;
            case "month":
                attributeClause.push([fn("MONTH", col("orderDate")), "month"]);
                attributeClause.push([fn("YEAR", col("orderDate")), "year"]);
                break;
            case "week":
                attributeClause.push([fn("WEEK", col("orderDate")), "week"]);
                attributeClause.push([fn("YEAR", col("orderDate")), "year"]);
                break;
            default:
                throw new Error("invalid time grouping");
        }

        // Add number of items to attributes
        attributeClause.push([fn("COUNT", col("order_id")), "count"]);

        // Dynamically add date restrictions based on input

        let whereClause: WhereOptions | undefined = {};
        if (startDate && endDate) {
            whereClause["orderDate"] = {
                [Op.between]: [startDate, endDate],
            };
        } else if (startDate && !endDate) {
            whereClause["orderDate"] = {
                [Op.gte]: startDate,
            };
        } else if (endDate) {
            whereClause["orderDate"] = {
                [Op.lte]: endDate,
            };
        } else {
            whereClause = undefined;
        }

        // Dynamically create include parameter if sorting by state or region

        let includeClause: IncludeOptions[] | undefined = undefined;
        if (byState || byRegion) {
            includeClause = [
                {
                    model: sqlAddress,
                    as: "Address",
                    attributes: [
                        byState
                            ? "stateAbbr"
                            : [literal(regionCaseStatement), "region"],
                    ],
                },
            ];
        }

        // Dynamically create group clause and order clause

        const sortOrder: SortOrder[] = [];
        const groupClause: GroupOption = [];
        if (byRegion) {
            // Since sequelize does not support grouping or ordering by dynamically created fields in associated tables, in order to group/order by region, the RAW sql that created the column must be repeated in the group/order clause.
            groupClause.push(literal(regionCaseStatement));
            sortOrder.push("region");
        } else if (byState) {
            groupClause.push("stateAbbr");
            sortOrder.push("stateAbbr");
        }

        if (["week", "month", "quarter", "year"].includes(granularity)) {
            groupClause.push(literal("YEAR(orderDate)"));
            sortOrder.push("year");
        }
        if (["week", "month", "quarter"].includes(granularity)) {
            groupClause.push(
                literal(`${granularity.toUpperCase()}(orderDate)`)
            );
            // SortOrder type must allow all granularity types except "all"
            sortOrder.push(`${granularity}` as SortOrder);
        }

        const results = await sqlOrder.findAll({
            where: whereClause,
            attributes: attributeClause,
            include: includeClause,
            group: groupClause,
            order: ["count"],
            raw: true,
        });
        const sortedResults = buildNestedDataArrays(sortOrder, results);
        return sortedResults;
    } catch (error) {
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error(
                "Error getting transactions over time: " + error.message
            );
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error(
                "An unknown error occurred while getting transactions over time"
            );
        }
    }
};

// Get items per transaction (by region? by state?)
export const getItemsPerTransaction = async (
    granularity: "week" | "month" | "quarter" | "year" | "all",
    startDate: string | null,
    endDate: string | null,
    byState: boolean = false,
    byRegion: boolean = false,
    chartType: ChartType
) => {
    try {
        // Dynamically construct attributes based on granularity input
        const attributeClause: FindAttributeOptions = [];
        switch (granularity) {
            case "all":
                break;
            case "year":
                attributeClause.push([fn("YEAR", col("orderDate")), "year"]);
                break;
            case "quarter":
                attributeClause.push([
                    literal("QUARTER(orderDate)"),
                    "quarter",
                ]);
                attributeClause.push([fn("YEAR", col("orderDate")), "year"]);
                break;
            case "month":
                attributeClause.push([fn("MONTH", col("orderDate")), "month"]);
                attributeClause.push([fn("YEAR", col("orderDate")), "year"]);
                break;
            case "week":
                attributeClause.push([fn("WEEK", col("orderDate")), "week"]);
                attributeClause.push([fn("YEAR", col("orderDate")), "year"]);
                break;
            default:
                throw new Error("invalid time grouping");
        }

        // Dynamically add date restrictions based on input

        let whereClause: WhereOptions | undefined = {};
        if (startDate && endDate) {
            whereClause["orderDate"] = {
                [Op.between]: [startDate, endDate],
            };
        } else if (startDate && !endDate) {
            whereClause["orderDate"] = {
                [Op.gte]: startDate,
            };
        } else if (endDate) {
            whereClause["orderDate"] = {
                [Op.lte]: endDate,
            };
        } else {
            whereClause = undefined;
        }

        // Dynamically create include parameter if sorting by state or region

        let includeClause: IncludeOptions[] = [
            {
                model: sqlOrderItem,
                as: "OrderItem",
                attributes: [
                    [
                        sequelize.literal(
                            `ROUND((SUM(quantity) / COUNT(DISTINCT OrderItem.order_id)), 2)`
                        ),
                        "averageQuantityPerOrder",
                    ],
                ],
            },
        ];
        if (byState || byRegion) {
            includeClause.push({
                model: sqlAddress,
                as: "Address",
                attributes: [
                    byState
                        ? "stateAbbr"
                        : [literal(regionCaseStatement), "region"],
                ],
            });
        }

        // Dynamically create group clause and order clause

        const sortOrder: SortOrder[] = [];
        const groupClause: GroupOption = [];
        if (byRegion) {
            // Since sequelize does not support grouping or ordering by dynamically created fields in associated tables, in order to group/order by region, the RAW sql that created the column must be repeated in the group/order clause.
            groupClause.push(literal(regionCaseStatement));
            sortOrder.push("region");
        } else if (byState) {
            groupClause.push("stateAbbr");
            sortOrder.push("stateAbbr");
        }

        if (["week", "month", "quarter", "year"].includes(granularity)) {
            groupClause.push(literal("YEAR(orderDate)"));
            sortOrder.push("year");
        }
        if (["week", "month", "quarter"].includes(granularity)) {
            groupClause.push(
                literal(`${granularity.toUpperCase()}(orderDate)`)
            );
            // SortOrder type must allow all granularity types except "all"
            sortOrder.push(`${granularity}` as SortOrder);
        }

        const results = await sqlOrder.findAll({
            where: whereClause,
            attributes: attributeClause,
            include: includeClause,
            group: groupClause,
            raw: true,
        });
        const sortedResults = buildNestedDataArrays(sortOrder, results);
        return sortedResults;
    } catch (error) {
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error(
                "Error getting items per transaction: " + error.message
            );
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error(
                "An unknown error occurred while getting items per transaction"
            );
        }
    }
};

// Get Average Order Value (by region? by state?)
export const getAverageOrderValue = async (
    granularity: "week" | "month" | "quarter",
    startDate: string | null,
    endDate: string | null,
    byState: boolean = false,
    byRegion: boolean = false,
    chartType: ChartType
) => {
    try {
        // Dynamically construct attributes based on granularity input
        const attributeClause: FindAttributeOptions = [
            [fn("YEAR", col("orderDate")), "year"],
        ];
        switch (granularity) {
            case "quarter":
                attributeClause.push([
                    literal("QUARTER(orderDate)"),
                    "quarter",
                ]);
                attributeClause.push([fn("YEAR", col("orderDate")), "year"]);
                break;
            case "month":
                attributeClause.push([fn("MONTH", col("orderDate")), "month"]);
                attributeClause.push([fn("YEAR", col("orderDate")), "year"]);
                break;
            case "week":
                attributeClause.push([fn("WEEK", col("orderDate")), "week"]);
                attributeClause.push([fn("YEAR", col("orderDate")), "year"]);
                break;
            default:
                throw new Error("invalid time grouping");
        }

        attributeClause.push([
            sequelize.literal(`ROUND((SUM(subTotal) / COUNT(order_id)), 2)`),
            "averageOrderValue",
        ]);

        // Dynamically add date restrictions based on input

        let whereClause: WhereOptions | undefined = {};
        if (startDate && endDate) {
            whereClause["orderDate"] = {
                [Op.between]: [startDate, endDate],
            };
        } else if (startDate && !endDate) {
            whereClause["orderDate"] = {
                [Op.gte]: startDate,
            };
        } else if (endDate) {
            whereClause["orderDate"] = {
                [Op.lte]: endDate,
            };
        } else {
            whereClause = undefined;
        }

        // Dynamically create include parameter if sorting by state or region

        let includeClause: IncludeOptions[] | undefined = [];
        if (byState || byRegion) {
            includeClause.push({
                model: sqlAddress,
                as: "Address",
                attributes: [
                    byState
                        ? "stateAbbr"
                        : [literal(regionCaseStatement), "region"],
                ],
            });
        } else {
            includeClause = undefined;
        }

        // Dynamically create group clause and order clause

        const sortOrder: SortOrder[] = [];
        const groupClause: GroupOption = [];
        if (byRegion) {
            // Since sequelize does not support grouping or ordering by dynamically created fields in associated tables, in order to group/order by region, the RAW sql that created the column must be repeated in the group/order clause.
            groupClause.push(literal(regionCaseStatement));
            sortOrder.push("region");
        } else if (byState) {
            groupClause.push("stateAbbr");
            sortOrder.push("stateAbbr");
        }

        groupClause.push(literal("YEAR(orderDate)"));
        sortOrder.push("year");

        if (["week", "month", "quarter"].includes(granularity)) {
            groupClause.push(
                literal(`${granularity.toUpperCase()}(orderDate)`)
            );
            // SortOrder type must allow all granularity types except "all"
            sortOrder.push(`${granularity}` as SortOrder);
        }

        const results = await sqlOrder.findAll({
            where: whereClause,
            attributes: attributeClause,
            include: includeClause,
            group: groupClause,
            raw: true,
        });
        const sortedResults = buildNestedDataArrays(sortOrder, results);
        return sortedResults;
    } catch (error) {
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error(
                "Error getting items per transaction: " + error.message
            );
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error(
                "An unknown error occurred while getting items per transaction"
            );
        }
    }
};

// Get Region percentages

export const getRegionRevenuePercentages = async (
    granularity: "week" | "month" | "quarter",
    startDate: string | null,
    endDate: string | null,
    byState: boolean = false,
    byRegion: boolean = false,
    chartType: ChartType
) => {
    try {
        // Dynamically construct attributes based on granularity input
        const attributeClause: FindAttributeOptions = [
            [fn("YEAR", col("orderDate")), "year"],
        ];
        switch (granularity) {
            case "quarter":
                attributeClause.push([
                    literal("QUARTER(orderDate)"),
                    "quarter",
                ]);
                break;
            case "month":
                attributeClause.push([fn("MONTH", col("orderDate")), "month"]);
                break;
            case "week":
                attributeClause.push([fn("WEEK", col("orderDate")), "week"]);
                break;
            default:
                throw new Error("invalid time grouping");
        }

        // Add sum data to attributes
        attributeClause.push([fn("SUM", col("subTotal")), "total_revenue"]);

        // Dynamically add date restrictions based on input

        let whereClause: WhereOptions | undefined = {};
        if (startDate && endDate) {
            whereClause["orderDate"] = {
                [Op.between]: [startDate, endDate],
            };
        } else if (startDate && !endDate) {
            whereClause["orderDate"] = {
                [Op.gte]: startDate,
            };
        } else if (endDate) {
            whereClause["orderDate"] = {
                [Op.lte]: endDate,
            };
        } else {
            whereClause = undefined;
        }

        // Dynamically create include parameter if sorting by state or region

        let includeClause: IncludeOptions[] | undefined = undefined;
        if (byState || byRegion) {
            includeClause = [
                {
                    model: sqlAddress,
                    as: "Address",
                    attributes: [
                        byState
                            ? "stateAbbr"
                            : [literal(regionCaseStatement), "region"],
                    ],
                },
            ];
        }

        // Dynamically create group clause and order clause

        const sortOrder: SortOrder[] = [];
        const groupClause: GroupOption = [];
        const periodGroupClause: GroupOption = [];
        const periodName: string[] = [];

        groupClause.push("year");
        periodGroupClause.push(literal("YEAR(orderDate)"));
        periodName.push("YEAR(orderDate)");
        sortOrder.push("year");
        if (["week", "month", "quarter"].includes(granularity)) {
            periodName.push(`'-${granularity.toUpperCase().substring(0, 1)}'`);
            periodName.push(`${granularity.toUpperCase()}(orderDate)`);
            periodGroupClause.push(
                literal(`${granularity.toUpperCase()}(orderDate)`)
            );
            // SortOrder type must allow all granularity types except "all"
            sortOrder.push(`${granularity}` as SortOrder);
        }

        if (byRegion) {
            // Since sequelize does not support grouping or ordering by dynamically created fields in associated tables, in order to group/order by region, the RAW sql that created the column must be repeated in the group/order clause.
            groupClause.push(literal(regionCaseStatement));
            sortOrder.push("region");
        } else if (byState) {
            groupClause.push("stateAbbr");
            sortOrder.push("stateAbbr");
        }

        const totalRevenueByPeriod = await sqlOrder.findAll({
            where: whereClause,
            attributes: [
                [fn("SUM", col("subTotal")), "total_revenue"],
                periodGroupClause && [
                    literal(`CONCAT(${periodName.join(", ")})`),
                    "period",
                ],
            ],
            include: includeClause,
            group: periodGroupClause,
            raw: true,
        });

        const totalRevenueMap: Record<string, number> = {};
        totalRevenueByPeriod.forEach((entry: any) => {
            const periodKey = entry.period || "all";
            totalRevenueMap[periodKey] = entry.total_revenue;
        });

        const results = await sqlOrder.findAll({
            where: whereClause,
            attributes: [
                ...attributeClause,
                periodGroupClause && [
                    literal(`CONCAT(${periodName.join(", ")})`),
                    "period",
                ],
            ],
            include: includeClause,
            group: groupClause,
            order: ["total_revenue"],
            raw: true,
        });

        const resultsWithPercentage = results.map((result: any) => {
            const periodKey = result.period; // Get the period from the SQL result
            const totalRevenueForPeriod = totalRevenueMap[periodKey] || 1; // Use the map, or default to 1
            const percentageOfTotal =
                (result.total_revenue / totalRevenueForPeriod) * 100;

            return {
                ...result,
                percentage_of_total: percentageOfTotal.toFixed(2), // Round to 2 decimal places
            };
        });

        const sortedResults = buildNestedDataArrays(
            sortOrder,
            resultsWithPercentage
        );
        return sortedResults;
    } catch (error) {
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error(
                "Error getting revenue over time: " + error.message
            );
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error(
                "An unknown error occurred while getting revenue over time"
            );
        }
    }
};
