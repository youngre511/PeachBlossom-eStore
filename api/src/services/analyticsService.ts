import sequelize from "../models/mysql/index.js";
import { QueryTypes } from "sequelize";
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
import { JoinReqTopProductRaw, TopProductResponse } from "./serviceTypes.js";

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

const buildRegionCase = (prefix?: string) => {
    let caseStatement = "CASE";

    for (const region in regions) {
        const states = regions[region].map((state) => `'${state}'`).join(", ");
        caseStatement += ` WHEN ${
            prefix ? prefix + "." : ""
        }stateAbbr IN (${states}) THEN '${region}'`;
    }

    caseStatement += " ELSE 'Unknown' END";

    return caseStatement;
};

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
        const startDateObj = startDate
            ? new Date(startDate)
            : new Date("01-01-2022");
        const endDateObj = endDate ? new Date(endDate) : new Date();

        // Define variables based on granularity
        let intervalUnit = "";
        let selectPeriod = "";
        let groupByPeriod = "";
        let orderByPeriod = "";
        let leftJoinCondition = "";

        switch (granularity) {
            case "year":
                intervalUnit = "1 YEAR";
                selectPeriod = "YEAR(p.period_date) AS year";
                groupByPeriod = "YEAR(p.period_date)";
                orderByPeriod = "YEAR(p.period_date)";
                leftJoinCondition = "YEAR(o.orderDate) = YEAR(p.period_date)";
                break;
            case "quarter":
                intervalUnit = "3 MONTH";
                selectPeriod =
                    "YEAR(p.period_date) AS year, QUARTER(p.period_date) AS quarter";
                groupByPeriod = "YEAR(p.period_date), QUARTER(p.period_date)";
                orderByPeriod = "YEAR(p.period_date), QUARTER(p.period_date)";
                leftJoinCondition =
                    "YEAR(o.orderDate) = YEAR(p.period_date) AND QUARTER(o.orderDate) = QUARTER(p.period_date)";
                break;
            case "month":
                intervalUnit = "1 MONTH";
                selectPeriod =
                    "YEAR(p.period_date) AS year, MONTH(p.period_date) AS month";
                groupByPeriod = "YEAR(p.period_date), MONTH(p.period_date)";
                orderByPeriod = "YEAR(p.period_date), MONTH(p.period_date)";
                leftJoinCondition =
                    "YEAR(o.orderDate) = YEAR(p.period_date) AND MONTH(o.orderDate) = MONTH(p.period_date)";
                break;
            case "week":
                intervalUnit = "1 WEEK";
                selectPeriod =
                    "YEAR(p.period_date) AS year, WEEK(p.period_date, 1) AS week"; // Using mode 1 for ISO weeks
                groupByPeriod = "YEAR(p.period_date), WEEK(p.period_date, 1)";
                orderByPeriod = "YEAR(p.period_date), WEEK(p.period_date, 1)";
                leftJoinCondition =
                    "YEAR(o.orderDate) = YEAR(p.period_date) AND WEEK(o.orderDate, 1) = WEEK(p.period_date, 1)";
                break;
            default:
                throw new Error("Invalid granularity");
        }

        // Build the raw SQL query
        const query = `
            WITH RECURSIVE periods AS (
                SELECT :startDate AS period_date
                UNION ALL
                SELECT DATE_ADD(period_date, INTERVAL ${intervalUnit})
                FROM periods
                WHERE period_date < :endDate
            )
            SELECT
                ${selectPeriod},
                ${byState ? "a.stateAbbr AS stateAbbr," : ""}
                ${byRegion ? `${buildRegionCase("a")} AS region,` : ""}
                COALESCE(SUM(o.subTotal), 0) AS total_revenue
            FROM periods p
            LEFT JOIN Orders o ON
                ${leftJoinCondition}
                AND o.orderDate BETWEEN :startDate AND :endDate
                ${byState || byRegion ? "AND o.address_id IS NOT NULL" : ""}
            ${
                byState || byRegion
                    ? "LEFT JOIN Addresses a ON o.address_id = a.address_id"
                    : ""
            }
            WHERE p.period_date BETWEEN :startDate AND :endDate
            GROUP BY ${groupByPeriod}
            ${byState ? ", a.stateAbbr" : ""}
            ${byRegion ? ", region" : ""}
            ORDER BY ${orderByPeriod}
            ${byState ? ", a.stateAbbr" : ""}
            ${byRegion ? ", region" : ""};
        `;

        // Prepare replacements
        const replacements = {
            startDate: startDateObj.toISOString().split("T")[0],
            endDate: endDateObj.toISOString().split("T")[0],
        };

        // Execute the raw SQL query
        const results = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: replacements,
        });

        const dataFormat = { y: "total_revenue" } as {
            id: SortOrder;
            id2?: "year";
            x: SortOrder | null;
            y: YValue;
        };
        if (byRegion && chartType !== "bar") {
            dataFormat["id"] = "region";
        } else if (byState && chartType !== "bar") {
            dataFormat["id"] = "stateAbbr";
        } else if (chartType === "bar") {
            dataFormat["id"] = granularity;
            dataFormat["id2"] = "year";
        } else {
            dataFormat["id"] = "year";
        }

        // SortOrder type must allow all granularity types except "all"
        if (chartType === "bar") {
            if (byRegion) {
                dataFormat["x"] = "region";
            } else if (byState) {
                dataFormat["x"] = "stateAbbr";
            } else {
                dataFormat["x"] = null;
            }
        } else {
            dataFormat["x"] = granularity as SortOrder;
        }

        const processedResults = buildChartObjects(
            results,
            chartType,
            dataFormat,
            "Revenue"
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
        const startDateObj = startDate
            ? new Date(startDate)
            : new Date("01-01-2022");
        const endDateObj = endDate ? new Date(endDate) : new Date();

        // Define the categories or subcategories CTE
        const categoryField = bySubcategory
            ? "subcategoryName"
            : "categoryName";
        const categoryTable = bySubcategory ? "Subcategories" : "Categories";

        let query = "";
        const replacements: Record<string, any> = {
            startDate: startDateObj.toISOString().split("T")[0],
            endDate: endDateObj.toISOString().split("T")[0],
        };

        if (stateAbbr) {
            replacements["stateAbbr"] = stateAbbr;
        }

        if (region) {
            replacements["region"] = region;
        }

        if (granularity === "all") {
            query = `
                WITH categories AS (
                    SELECT DISTINCT ${categoryField} AS categoryName FROM ${categoryTable}
                ),
                category_revenue AS (
                    SELECT
                        cat.${categoryField} AS categoryName,
                        SUM(oi.quantity * oi.priceWhenOrdered) AS total_revenue
                    FROM OrderItems oi
                    JOIN Orders o ON oi.order_id = o.order_id
                    JOIN Products pr ON oi.productNo = pr.productNo
                    JOIN ${categoryTable} cat ON pr.${
                bySubcategory ? "subcategory_id" : "category_id"
            } = cat.${bySubcategory ? "subcategory_id" : "category_id"}
                    ${
                        stateAbbr || region
                            ? `
                    JOIN Addresses addr ON o.address_id = addr.address_id
                    `
                            : ""
                    }
                    WHERE o.orderDate BETWEEN :startDate AND :endDate
                    ${stateAbbr ? `AND addr.stateAbbr = :stateAbbr` : ""}
                    ${region ? `AND ${buildRegionCase("addr")} = :region` : ""}
                    GROUP BY categoryName
                ),
                total_revenue AS (
                    SELECT
                        SUM(oi.quantity * oi.priceWhenOrdered) AS total_revenue
                    FROM OrderItems oi
                    JOIN Orders o ON oi.order_id = o.order_id
                    ${
                        stateAbbr || region
                            ? `
                    JOIN Addresses addr ON o.address_id = addr.address_id
                    `
                            : ""
                    }
                    WHERE o.orderDate BETWEEN :startDate AND :endDate
                    ${stateAbbr ? `AND addr.stateAbbr = :stateAbbr` : ""}
                    ${region ? `AND ${buildRegionCase("addr")} = :region` : ""}
                )
                SELECT
                    c.categoryName AS ${categoryField},
                    COALESCE(cr.total_revenue, 0) AS total_revenue,
                    tr.total_revenue AS total_period_revenue,
                    CASE
                        WHEN tr.total_revenue = 0 THEN 0
                        ELSE ROUND((COALESCE(cr.total_revenue, 0) / tr.total_revenue) * 100, 2)
                    END AS percentage_of_total
                FROM categories c
                LEFT JOIN category_revenue cr ON cr.categoryName = c.categoryName
                CROSS JOIN total_revenue tr
                ORDER BY c.categoryName;
            `;
        } else {
            // Define variables based on granularity
            let intervalUnit = "";
            let selectPeriodMain = "";
            let selectPeriodSub = "";
            let groupByPeriodMain = "";
            let groupByPeriodSub = "";
            let orderByPeriod = "";
            let periodJoinConditionRd = "";
            let periodJoinConditionTr = "";

            switch (granularity) {
                case "year":
                    intervalUnit = "1 YEAR";
                    selectPeriodMain = "YEAR(p.period_date) AS year";
                    selectPeriodSub = "YEAR(o.orderDate) AS year";
                    groupByPeriodMain = "YEAR(p.period_date)";
                    groupByPeriodSub = "YEAR(o.orderDate)";
                    orderByPeriod = "YEAR(p.period_date)";
                    periodJoinConditionRd = "rd.year = YEAR(p.period_date)";
                    periodJoinConditionTr = "tr.year = YEAR(p.period_date)";
                    break;
                case "quarter":
                    intervalUnit = "1 QUARTER";
                    selectPeriodMain =
                        "YEAR(p.period_date) AS year, QUARTER(p.period_date) AS quarter";
                    selectPeriodSub =
                        "YEAR(o.orderDate) AS year, QUARTER(o.orderDate) AS quarter";
                    groupByPeriodMain =
                        "YEAR(p.period_date), QUARTER(p.period_date)";
                    groupByPeriodSub =
                        "YEAR(o.orderDate), QUARTER(o.orderDate)";
                    orderByPeriod =
                        "YEAR(p.period_date), QUARTER(p.period_date)";
                    periodJoinConditionRd =
                        "rd.year = YEAR(p.period_date) AND rd.quarter = QUARTER(p.period_date)";
                    periodJoinConditionTr =
                        "tr.year = YEAR(p.period_date) AND tr.quarter = QUARTER(p.period_date)";
                    break;
                case "month":
                    intervalUnit = "1 MONTH";
                    selectPeriodMain =
                        "YEAR(p.period_date) AS year, MONTH(p.period_date) AS month";
                    selectPeriodSub =
                        "YEAR(o.orderDate) AS year, MONTH(o.orderDate) AS month";
                    groupByPeriodMain =
                        "YEAR(p.period_date), MONTH(p.period_date)";
                    groupByPeriodSub = "YEAR(o.orderDate), MONTH(o.orderDate)";
                    orderByPeriod = "YEAR(p.period_date), MONTH(p.period_date)";
                    periodJoinConditionRd =
                        "rd.year = YEAR(p.period_date) AND rd.month = MONTH(p.period_date)";
                    periodJoinConditionTr =
                        "tr.year = YEAR(p.period_date) AND tr.month = MONTH(p.period_date)";
                    break;
                case "week":
                    intervalUnit = "1 WEEK";
                    selectPeriodMain =
                        "YEAR(p.period_date) AS year, WEEK(p.period_date, 1) AS week";
                    selectPeriodSub =
                        "YEAR(o.orderDate) AS year, WEEK(o.orderDate, 1) AS week";
                    groupByPeriodMain =
                        "YEAR(p.period_date), WEEK(p.period_date, 1)";
                    groupByPeriodSub =
                        "YEAR(o.orderDate), WEEK(o.orderDate, 1)";
                    orderByPeriod =
                        "YEAR(p.period_date), WEEK(p.period_date, 1)";
                    periodJoinConditionRd =
                        "rd.year = YEAR(p.period_date) AND rd.week = WEEK(p.period_date, 1)";
                    periodJoinConditionTr =
                        "tr.year = YEAR(p.period_date) AND tr.week = WEEK(p.period_date, 1)";
                    break;
                default:
                    throw new Error("Invalid granularity");
            }

            // Build the raw SQL query
            query = `
            WITH RECURSIVE periods AS (
                SELECT DATE(:startDate) AS period_date
                UNION ALL
                SELECT DATE_ADD(period_date, INTERVAL ${intervalUnit})
                FROM periods
                WHERE period_date < DATE(:endDate)
            ),
            categories AS (
                SELECT DISTINCT ${categoryField} AS category_name FROM ${categoryTable}
            )
            SELECT
                ${selectPeriodMain},
                c.category_name AS ${categoryField},
                COALESCE(rd.total_revenue, 0) AS total_revenue,
                COALESCE(tr.total_revenue, 0) AS total_period_revenue,
                CASE
                    WHEN COALESCE(tr.total_revenue, 0) = 0 THEN 0
                    ELSE ROUND((COALESCE(rd.total_revenue, 0) / tr.total_revenue) * 100, 2)
                END AS percentage_of_total
            FROM periods p
            CROSS JOIN categories c
            LEFT JOIN (
            -- Subquery rd: Revenue by category per period
                SELECT
                    ${selectPeriodSub},
                    cat.${categoryField} AS category_name,
                    SUM(oi.quantity * oi.priceWhenOrdered) AS total_revenue
                FROM OrderItems oi
                JOIN Orders o ON oi.order_id = o.order_id
                JOIN Products pr ON oi.productNo = pr.productNo
                JOIN ${categoryTable} cat ON pr.${
                bySubcategory ? "subcategory_id" : "category_id"
            } = cat.${bySubcategory ? "subcategory_id" : "category_id"}
                ${
                    stateAbbr || region
                        ? `
                JOIN Addresses addr ON o.address_id = addr.address_id
                `
                        : ""
                }
                WHERE o.orderDate BETWEEN :startDate AND :endDate
                ${
                    region
                        ? `
                AND ${buildRegionCase("addr")} = :region
                `
                        : ""
                }
                ${
                    stateAbbr
                        ? `
                AND addr.stateAbbr = :stateAbbr
                `
                        : ""
                }
                GROUP BY ${groupByPeriodSub}, category_name
            ) rd ON
                ${periodJoinConditionRd}
                AND rd.category_name = c.category_name
            LEFT JOIN (
                -- Subquery tr: Total revenue per period
                SELECT
                    ${selectPeriodSub},
                    SUM(oi.quantity * oi.priceWhenOrdered) AS total_revenue
                FROM OrderItems oi
                JOIN Orders o ON oi.order_id = o.order_id
                ${
                    stateAbbr || region
                        ? `
                JOIN Addresses addr ON o.address_id = addr.address_id
                `
                        : ""
                }
                WHERE o.orderDate BETWEEN :startDate AND :endDate
                ${stateAbbr ? `AND addr.stateAbbr = :stateAbbr` : ""}
                ${region ? `AND ${buildRegionCase("addr")} = :region` : ""}
                GROUP BY ${groupByPeriodSub}
            ) tr ON
                ${periodJoinConditionTr}
            ORDER BY ${orderByPeriod}, c.category_name;
        `;
        }

        // Execute the raw SQL query
        const results = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: replacements,
        });

        const dataFormat = {
            y: returnPercentage ? "percentage_of_total" : "total_revenue",
        } as {
            id: SortOrder;
            id2?: SortOrder;
            x: SortOrder | "all";
            y: YValue;
        };

        if (chartType === "bar" && granularity !== "all") {
            if (bySubcategory) {
                dataFormat.x = "subcategoryName";
            } else {
                dataFormat.x = "categoryName";
            }

            dataFormat.id = granularity;
            if (granularity !== "year") {
                dataFormat.id2 = "year";
            }
        } else {
            if (bySubcategory) {
                dataFormat.id = "subcategoryName";
                dataFormat.x = granularity;
            } else {
                dataFormat.id = "categoryName";
                dataFormat.x = granularity;
            }
        }

        // Dynamically create group clause

        const processedResults = buildChartObjects(
            results,
            chartType,
            dataFormat,
            returnPercentage ? "Percent of Total" : undefined
        );

        const returnObject: Record<
            string,
            string | LineChartData[] | PieChartData[] | BarChartData[]
        > = {
            results: processedResults,
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
        const startDateObj = startDate
            ? new Date(startDate)
            : new Date("01-01-2022");
        const endDateObj = endDate ? new Date(endDate) : new Date();

        // Prepare replacements
        const replacements = {
            startDate: startDateObj.toISOString().split("T")[0],
            endDate: endDateObj.toISOString().split("T")[0],
        };

        let query = "";

        if (granularity === "all") {
            // Build the raw SQL query
            query = `

            SELECT
                ${byState ? "a.stateAbbr AS stateAbbr," : ""}
                ${byRegion ? `${buildRegionCase("a")} AS region,` : ""}
                COUNT(o.order_id) AS count
            FROM Orders o
            ${
                byState || byRegion
                    ? "LEFT JOIN Addresses a ON o.address_id = a.address_id"
                    : ""
            }
            WHERE o.orderDate BETWEEN :startDate AND :endDate
            ${byState ? "GROUP BY a.stateAbbr" : ""}
            ${byRegion ? "GROUP BY region" : ""}
            ${byState ? "ORDER BY a.stateAbbr" : ""}
            ${byRegion ? "ORDER BY region" : ""};
        `;
        } else {
            // Define variables based on granularity
            let intervalUnit = "";
            let selectPeriod = "";
            let groupByPeriod = "";
            let orderByPeriod = "";
            let leftJoinCondition = "";

            switch (granularity) {
                case "year":
                    intervalUnit = "1 YEAR";
                    selectPeriod = "YEAR(p.period_date) AS year";
                    groupByPeriod = "YEAR(p.period_date)";
                    orderByPeriod = "YEAR(p.period_date)";
                    leftJoinCondition =
                        "YEAR(o.orderDate) = YEAR(p.period_date)";
                    break;
                case "quarter":
                    intervalUnit = "3 MONTH";
                    selectPeriod =
                        "YEAR(p.period_date) AS year, QUARTER(p.period_date) AS quarter";
                    groupByPeriod =
                        "YEAR(p.period_date), QUARTER(p.period_date)";
                    orderByPeriod =
                        "YEAR(p.period_date), QUARTER(p.period_date)";
                    leftJoinCondition =
                        "YEAR(o.orderDate) = YEAR(p.period_date) AND QUARTER(o.orderDate) = QUARTER(p.period_date)";
                    break;
                case "month":
                    intervalUnit = "1 MONTH";
                    selectPeriod =
                        "YEAR(p.period_date) AS year, MONTH(p.period_date) AS month";
                    groupByPeriod = "YEAR(p.period_date), MONTH(p.period_date)";
                    orderByPeriod = "YEAR(p.period_date), MONTH(p.period_date)";
                    leftJoinCondition =
                        "YEAR(o.orderDate) = YEAR(p.period_date) AND MONTH(o.orderDate) = MONTH(p.period_date)";
                    break;
                case "week":
                    intervalUnit = "1 WEEK";
                    selectPeriod =
                        "YEAR(p.period_date) AS year, WEEK(p.period_date, 1) AS week"; // Using mode 1 for ISO weeks
                    groupByPeriod =
                        "YEAR(p.period_date), WEEK(p.period_date, 1)";
                    orderByPeriod =
                        "YEAR(p.period_date), WEEK(p.period_date, 1)";
                    leftJoinCondition =
                        "YEAR(o.orderDate) = YEAR(p.period_date) AND WEEK(o.orderDate, 1) = WEEK(p.period_date, 1)";
                    break;
                default:
                    throw new Error("Invalid granularity");
            }

            // Build the raw SQL query
            query = `
            WITH RECURSIVE periods AS (
                SELECT :startDate AS period_date
                UNION ALL
                SELECT DATE_ADD(period_date, INTERVAL ${intervalUnit})
                FROM periods
                WHERE period_date < :endDate
            )
            SELECT
                ${selectPeriod},
                ${byState ? "a.stateAbbr AS stateAbbr," : ""}
                ${byRegion ? `${buildRegionCase("a")} AS region,` : ""}
                COUNT(o.order_id) AS count
            FROM periods p
            LEFT JOIN Orders o ON
                ${leftJoinCondition}
                AND o.orderDate BETWEEN :startDate AND :endDate
                ${byState || byRegion ? "AND o.address_id IS NOT NULL" : ""}
            ${
                byState || byRegion
                    ? "LEFT JOIN Addresses a ON o.address_id = a.address_id"
                    : ""
            }
            WHERE p.period_date BETWEEN :startDate AND :endDate
            GROUP BY ${groupByPeriod}
            ${byState ? ", a.stateAbbr" : ""}
            ${byRegion ? ", region" : ""}
            ORDER BY ${orderByPeriod}
            ${byState ? ", a.stateAbbr" : ""}
            ${byRegion ? ", region" : ""};
        `;
        }

        // Execute the raw SQL query
        const results = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: replacements,
        });

        // Dynamically create data format and group clause

        const dataFormat = { y: "count" } as {
            id: SortOrder;
            id2?: "year";
            x: SortOrder | null;
            y: YValue;
        };

        if (byRegion) {
            dataFormat["id"] = "region";
        } else if (byState) {
            dataFormat["id"] = "stateAbbr";
        } else if (chartType === "bar") {
            dataFormat["id"] = granularity as SortOrder;
            if (granularity !== "year") {
                dataFormat["id2"] = "year";
            }
        } else {
            dataFormat["id"] = "year";
        }

        // SortOrder type must allow all granularity types except "all"
        dataFormat["x"] =
            chartType === "bar" ? null : (granularity as SortOrder);

        // if (granularity !== "all") {
        const processedResults = buildChartObjects(
            results,
            chartType,
            dataFormat,
            "Transactions"
        );
        return processedResults;
        // } else {
        //     return results;
        // }
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
    granularity: "week" | "month" | "quarter" | "year",
    startDate: string | null,
    endDate: string | null,
    byState: boolean = false,
    byRegion: boolean = false,
    chartType: ChartType
) => {
    try {
        const startDateObj = startDate
            ? new Date(startDate)
            : new Date("01-01-2022");
        const endDateObj = endDate ? new Date(endDate) : new Date();

        // Define variables based on granularity
        let intervalUnit = "";
        let selectPeriodMain = "";
        let selectPeriodSub = "";
        let groupByPeriodMain = "";
        let groupByPeriodSub = "";
        let orderByPeriod = "";
        let periodJoinCondition = "";

        switch (granularity) {
            case "year":
                intervalUnit = "1 YEAR";
                selectPeriodMain = "YEAR(p.period_date) AS year";
                selectPeriodSub = "YEAR(o.orderDate) AS year";
                groupByPeriodMain = "YEAR(p.period_date)";
                groupByPeriodSub = "YEAR(o.orderDate)";
                orderByPeriod = "YEAR(p.period_date)";
                periodJoinCondition = "it.year = YEAR(p.period_date)";
                break;
            case "quarter":
                intervalUnit = "1 QUARTER";
                selectPeriodMain =
                    "YEAR(p.period_date) AS year, QUARTER(p.period_date) AS quarter";
                selectPeriodSub =
                    "YEAR(o.orderDate) AS year, QUARTER(o.orderDate) AS quarter";
                groupByPeriodMain =
                    "YEAR(p.period_date), QUARTER(p.period_date)";
                groupByPeriodSub = "YEAR(o.orderDate), QUARTER(o.orderDate)";
                orderByPeriod = "YEAR(p.period_date), QUARTER(p.period_date)";
                periodJoinCondition =
                    "it.year = YEAR(p.period_date) AND it.quarter = QUARTER(p.period_date)";
                break;
            case "month":
                intervalUnit = "1 MONTH";
                selectPeriodMain =
                    "YEAR(p.period_date) AS year, MONTH(p.period_date) AS month";
                selectPeriodSub =
                    "YEAR(o.orderDate) AS year, MONTH(o.orderDate) AS month";
                groupByPeriodMain = "YEAR(p.period_date), MONTH(p.period_date)";
                groupByPeriodSub = "YEAR(o.orderDate), MONTH(o.orderDate)";
                orderByPeriod = "YEAR(p.period_date), MONTH(p.period_date)";
                periodJoinCondition =
                    "it.year = YEAR(p.period_date) AND it.month = MONTH(p.period_date)";
                break;
            case "week":
                intervalUnit = "1 WEEK";
                selectPeriodMain =
                    "YEAR(p.period_date) AS year, WEEK(p.period_date, 1) AS week";
                selectPeriodSub =
                    "YEAR(o.orderDate) AS year, WEEK(o.orderDate, 1) AS week";
                groupByPeriodMain =
                    "YEAR(p.period_date), WEEK(p.period_date, 1)";
                groupByPeriodSub = "YEAR(o.orderDate), WEEK(o.orderDate, 1)";
                orderByPeriod = "YEAR(p.period_date), WEEK(p.period_date, 1)";
                periodJoinCondition =
                    "it.year = YEAR(p.period_date) AND it.week = WEEK(p.period_date, 1)";

                break;

            default:
                throw new Error("Invalid granularity");
        }

        const query = `
            WITH RECURSIVE periods AS (
                SELECT :startDate AS period_date
                UNION ALL
                SELECT DATE_ADD(period_date, INTERVAL ${intervalUnit})
                FROM periods
                WHERE period_date < :endDate
            )
            SELECT
                ${selectPeriodMain},
                CASE
                    WHEN COALESCE(it.total_transactions, 0) = 0 THEN 0
                    ELSE ROUND((COALESCE(it.total_items, 0) / it.total_transactions), 2)
                END AS averageQuantityPerOrder
            FROM periods p
            LEFT JOIN (
                SELECT
                    ${selectPeriodSub},
                    SUM(oi.quantity) as total_items,
                    COUNT(DISTINCT o.order_id) AS total_transactions
                FROM Orders o
                JOIN OrderItems oi ON oi.order_id = o.order_id
                ${
                    byState || byRegion
                        ? `
                    JOIN Addresses a ON o.address_id = a.address_id
                    `
                        : ""
                }
                WHERE o.orderDate BETWEEN :startDate AND :endDate
                ${byState ? "AND a.stateAbbr AS stateAbbr," : ""}
                ${byRegion ? `AND ${buildRegionCase("a")} AS region,` : ""}
                GROUP BY ${groupByPeriodSub}
            ) it ON 
                ${periodJoinCondition}
            WHERE p.period_date BETWEEN :startDate AND :endDate
            GROUP BY ${groupByPeriodMain}
            ${byState ? ", a.stateAbbr" : ""}
            ${byRegion ? ", region" : ""}
            ORDER BY ${orderByPeriod}
            ${byState ? ", a.stateAbbr" : ""}
            ${byRegion ? ", region" : ""};
        `;

        // Prepare replacements
        const replacements = {
            startDate: startDateObj.toISOString().split("T")[0],
            endDate: endDateObj.toISOString().split("T")[0],
        };

        // Execute the raw SQL query
        const results = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: replacements,
        });

        // Dynamically create data format

        const dataFormat = { y: "averageQuantityPerOrder" } as {
            id: SortOrder;
            id2?: "year";
            x: SortOrder | null;
            y: YValue;
        };

        if (byRegion) {
            dataFormat["id"] = "region";
        } else if (byState) {
            dataFormat["id"] = "stateAbbr";
        } else if (chartType === "bar") {
            dataFormat["id"] = granularity;
            dataFormat["id2"] = "year";
        } else {
            dataFormat["id"] = "year";
        }

        // SortOrder type must allow all granularity types except "all"
        dataFormat["x"] =
            chartType === "bar" ? null : (granularity as SortOrder);

        const processedResults = buildChartObjects(
            results,
            chartType,
            dataFormat,
            "Items"
        );
        return processedResults;
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
        const startDateObj = startDate
            ? new Date(startDate)
            : new Date("01-01-2022");
        const endDateObj = endDate ? new Date(endDate) : new Date();

        // Define variables based on granularity
        let intervalUnit = "";
        let selectPeriodMain = "";
        let selectPeriodSub = "";
        let groupByPeriodMain = "";
        let groupByPeriodSub = "";
        let orderByPeriod = "";
        let periodJoinCondition = "";

        switch (granularity) {
            case "quarter":
                intervalUnit = "1 QUARTER";
                selectPeriodMain =
                    "YEAR(p.period_date) AS year, QUARTER(p.period_date) AS quarter";
                selectPeriodSub =
                    "YEAR(o.orderDate) AS year, QUARTER(o.orderDate) AS quarter";
                groupByPeriodMain =
                    "YEAR(p.period_date), QUARTER(p.period_date)";
                groupByPeriodSub = "YEAR(o.orderDate), QUARTER(o.orderDate)";
                orderByPeriod = "YEAR(p.period_date), QUARTER(p.period_date)";
                periodJoinCondition =
                    "it.year = YEAR(p.period_date) AND it.quarter = QUARTER(p.period_date)";
                break;
            case "month":
                intervalUnit = "1 MONTH";
                selectPeriodMain =
                    "YEAR(p.period_date) AS year, MONTH(p.period_date) AS month";
                selectPeriodSub =
                    "YEAR(o.orderDate) AS year, MONTH(o.orderDate) AS month";
                groupByPeriodMain = "YEAR(p.period_date), MONTH(p.period_date)";
                groupByPeriodSub = "YEAR(o.orderDate), MONTH(o.orderDate)";
                orderByPeriod = "YEAR(p.period_date), MONTH(p.period_date)";
                periodJoinCondition =
                    "it.year = YEAR(p.period_date) AND it.month = MONTH(p.period_date)";
                break;
            case "week":
                intervalUnit = "1 WEEK";
                selectPeriodMain =
                    "YEAR(p.period_date) AS year, WEEK(p.period_date, 1) AS week";
                selectPeriodSub =
                    "YEAR(o.orderDate) AS year, WEEK(o.orderDate, 1) AS week";
                groupByPeriodMain =
                    "YEAR(p.period_date), WEEK(p.period_date, 1)";
                groupByPeriodSub = "YEAR(o.orderDate), WEEK(o.orderDate, 1)";
                orderByPeriod = "YEAR(p.period_date), WEEK(p.period_date, 1)";
                periodJoinCondition =
                    "it.year = YEAR(p.period_date) AND it.week = WEEK(p.period_date, 1)";

                break;

            default:
                throw new Error("Invalid granularity");
        }

        const query = `
            WITH RECURSIVE periods AS (
                SELECT :startDate AS period_date
                UNION ALL
                SELECT DATE_ADD(period_date, INTERVAL ${intervalUnit})
                FROM periods
                WHERE period_date < :endDate
            )
            SELECT
                ${selectPeriodMain},
                CASE
                    WHEN COALESCE(it.total_transactions, 0) = 0 THEN 0
                    ELSE ROUND((COALESCE(it.total_value, 0) / it.total_transactions), 2)
                END AS averageOrderValue
            FROM periods p
            LEFT JOIN (
                SELECT
                    ${selectPeriodSub},
                    SUM(oi.quantity * oi.priceWhenOrdered) as total_value,
                    COUNT(DISTINCT o.order_id) AS total_transactions
                FROM Orders o
                JOIN OrderItems oi ON oi.order_id = o.order_id
                ${
                    byState || byRegion
                        ? `
                    JOIN Addresses a ON o.address_id = a.address_id
                    `
                        : ""
                }
                WHERE o.orderDate BETWEEN :startDate AND :endDate
                ${byState ? "AND a.stateAbbr AS stateAbbr," : ""}
                ${byRegion ? `AND ${buildRegionCase("a")} AS region,` : ""}
                GROUP BY ${groupByPeriodSub}
            ) it ON 
                ${periodJoinCondition}
            WHERE p.period_date BETWEEN :startDate AND :endDate
            GROUP BY ${groupByPeriodMain}
            ${byState ? ", a.stateAbbr" : ""}
            ${byRegion ? ", region" : ""}
            ORDER BY ${orderByPeriod}
            ${byState ? ", a.stateAbbr" : ""}
            ${byRegion ? ", region" : ""};
        `;

        // Prepare replacements
        const replacements = {
            startDate: startDateObj.toISOString().split("T")[0],
            endDate: endDateObj.toISOString().split("T")[0],
        };

        // Execute the raw SQL query
        const results = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: replacements,
        });

        // Dynamically create group clause
        const dataFormat = { y: "averageOrderValue" } as {
            id: SortOrder;
            id2?: "year";
            x: SortOrder | null;
            y: YValue;
        };

        if (byRegion) {
            dataFormat["id"] = "region";
        } else if (byState) {
            dataFormat["id"] = "stateAbbr";
        } else if (chartType === "bar") {
            dataFormat["id"] = granularity;
            dataFormat["id2"] = "year";
        } else {
            dataFormat["id"] = "year";
        }

        // SortOrder type must allow all granularity types except "all"
        dataFormat["x"] =
            chartType === "bar" ? null : (granularity as SortOrder);

        const processedResults = buildChartObjects(
            results,
            chartType,
            dataFormat,
            "Average Value"
        );
        return processedResults;
    } catch (error) {
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error(
                "Error getting average order value: " + error.message
            );
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error(
                "An unknown error occurred while getting average order value"
            );
        }
    }
};

// Get Region percentages

export const getRegionRevenuePercentages = async (
    granularity: "week" | "month" | "quarter" | "year" | "all",
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
            case "all":
                break;
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
                            : [literal(buildRegionCase()), "region"],
                    ],
                },
            ];
        }

        // Dynamically create group clause and order clause

        const dataFormat = { x: granularity, y: "percentage_of_total" } as {
            id: SortOrder;
            x: SortOrder;
            y: YValue;
        };
        const groupClause: GroupOption = [];
        const periodGroupClause: GroupOption = [];
        const periodName: string[] = [];

        if (granularity !== "all") {
            groupClause.push("year");
            periodGroupClause.push(literal("YEAR(orderDate)"));
            periodName.push("YEAR(orderDate)");
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

        if (byRegion) {
            // Since sequelize does not support grouping or ordering by dynamically created fields in associated tables, in order to group/order by region, the RAW sql that created the column must be repeated in the group/order clause.
            groupClause.push(literal(buildRegionCase()));
            dataFormat.id = "region";
        } else if (byState) {
            groupClause.push("stateAbbr");
            dataFormat.id = "stateAbbr";
        }

        const totalAttributeClause: FindAttributeOptions = [
            [fn("SUM", col("subTotal")), "total_revenue"],
        ];
        if (periodGroupClause.length > 1) {
            totalAttributeClause.push([
                literal(`CONCAT(${periodName.join(", ")})`),
                "period",
            ]);
            attributeClause.push([
                literal(`CONCAT(${periodName.join(", ")})`),
                "period",
            ]);
        }

        const totalRevenueByPeriod = await sqlOrder.findAll({
            where: whereClause,
            attributes: totalAttributeClause,
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
            attributes: attributeClause,
            include: includeClause,
            group: groupClause,
            order: ["total_revenue"],
            raw: true,
        });

        const resultsWithPercentage = results.map((result: any) => {
            const periodKey = result.period || "all"; // Get the period from the SQL result
            const totalRevenueForPeriod = totalRevenueMap[periodKey] || 1; // Use the map, or default to 1

            const percentageOfTotal =
                (result.total_revenue / totalRevenueForPeriod) * 100;

            return {
                ...result,
                percentage_of_total: percentageOfTotal.toFixed(2), // Round to 2 decimal places
            };
        });

        const processedResults = buildChartObjects(
            resultsWithPercentage,
            chartType,
            dataFormat
        );
        return processedResults;
    } catch (error) {
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error(
                "Error getting regional revenue percentages: " + error.message
            );
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error(
                "An unknown error occurred while getting regional revenue percentages"
            );
        }
    }
};

////// GET TOP 5 ADMIN PRODUCTS ///////

export const getTopProducts = async (
    period: "7d" | "30d" | "6m" | "1y" | "allTime",
    worst: boolean = false,
    number: number = 5
) => {
    const startDate = new Date();

    switch (period) {
        case "7d":
            startDate.setDate(startDate.getDate() - 7);
            break;
        case "30d":
            startDate.setDate(startDate.getDate() - 30);
            break;
        case "6m":
            startDate.setMonth(startDate.getMonth() - 6);
            break;
        case "1y":
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
        default:
            break;
    }

    const utcStartDate = startDate.toISOString();

    let whereClause: WhereOptions | undefined = {};
    if (period !== "allTime") {
        whereClause["orderDate"] = {
            [Op.gte]: utcStartDate,
        };
    } else {
        whereClause = undefined;
    }

    const topProducts = (await sqlProduct.findAll({
        include: [
            {
                model: sqlCategory,
                as: "Category",
            },
            {
                model: sqlSubcategory,
                as: "Subcategory",
            },
            {
                model: sqlOrderItem,
                as: "OrderItem",
                attributes: [
                    "productNo",
                    [fn("SUM", col("quantity")), "totalQuantity"],
                ],
                include: [
                    {
                        model: sqlOrder,
                        as: "Order",
                        attributes: [],
                        where: whereClause,
                    },
                ],
                required: true,
            },
        ],
        group: ["sqlProduct.productNo"],
        order: [
            [fn("SUM", col("OrderItem.quantity")), worst ? "ASC" : "DESC"],
            ["price", "DESC"],
        ],
        raw: true,
    })) as unknown as JoinReqTopProductRaw[];

    const top = topProducts.slice(0, number);

    //Format Data
    const topProductRecords: Array<TopProductResponse> = top.map((product) => {
        const catObj = {
            thumbnailUrl: product.thumbnailUrl,
            name: product.productName,
            productNo: product.productNo,
            price: product.price,
            category: product["Category.categoryName"],
            subcategory: product["Subcategory.subcategoryName"],
            description: product.description,
            totalQuantity: product["OrderItem.totalQuantity"],
        };
        return catObj;
    });

    return topProductRecords;
};
