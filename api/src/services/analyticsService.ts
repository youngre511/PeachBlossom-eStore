import sequelize from "../models/mysql/index.js";
import { QueryTypes } from "sequelize";
import { sqlOrder } from "../models/mysql/sqlOrderModel.js";
import { sqlOrderItem } from "../models/mysql/sqlOrderItemModel.js";
import { sqlProduct } from "../models/mysql/sqlProductModel.js";
import { sqlCategory } from "../models/mysql/sqlCategoryModel.js";
import { sqlSubcategory } from "../models/mysql/sqlSubcategoryModel.js";
import { Op, fn, col, WhereOptions } from "sequelize";
import { ChartType } from "../controllers/analyticsController.js";
import buildChartObjects, {
    BarChartData,
    LineChartData,
    PieChartData,
} from "../utils/buildChartObjects.js";
import { JoinReqTopProductRaw, TopProductResponse } from "./serviceTypes.js";
import buildDateRange from "../utils/buildDateRange.js";
import getQueryVariables from "../utils/getQueryVariables.js";

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

/**
 * @description A function to retrieve revenue data.
 * @params Granularity: the periods by which data should be grouped. An optional start date. An optional end date.
 *         Booleans for instructing the function to group the results by state or region. The chart type for which the data should be formatted
 */

export const getRevenueOverTime = async (
    granularity: "week" | "month" | "quarter" | "year",
    startDate: string | null,
    endDate: string | null,
    byState: boolean = false,
    byRegion: boolean = false,
    chartType: ChartType
) => {
    try {
        // Define variables based on granularity
        const {
            intervalUnit,
            selectPeriod,
            groupByPeriod,
            orderByPeriod,
            leftJoinCondition,
        } = getQueryVariables({
            granularity,
            sub: false,
            joinConditions: { leftJoinCondition: "o.orderDate" },
        });

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
        const replacements: Record<string, any> = buildDateRange(
            startDate,
            endDate
        );

        // Execute the raw SQL query
        const results = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: replacements,
        });

        const dataFormat = { y: "total_revenue" } as {
            id: SortOrder | null;
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
            if (granularity !== "year") {
                dataFormat["id2"] = "year";
            }
        } else if (chartType === "line" && granularity === "year") {
            dataFormat["id"] = null;
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

/**
 * @description A function to retrieve revenue trends grouped by category or subcategory.
 * @params Granularity: the periods by which data should be grouped. An optional start date. An optional end date.
 *         A state abbreviation or region for narrowing results.
 *         A boolean instructing the function to group by subcategory instead of category.
 *         A boolean instructing the function to return revenue values or revenue percentages for each (sub)category
 *         The chart type for which the data should be formatted
 */

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
        // Define the categories or subcategories CTE
        const categoryField = bySubcategory
            ? "subcategoryName"
            : "categoryName";
        const categoryTable = bySubcategory ? "Subcategories" : "Categories";

        let query = "";
        const replacements: Record<string, any> = buildDateRange(
            startDate,
            endDate
        );

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
            const {
                intervalUnit,
                selectPeriodMain,
                selectPeriodSub,
                groupByPeriodMain,
                groupByPeriodSub,
                orderByPeriod,
                periodJoinConditionRd,
                periodJoinConditionTr,
            } = getQueryVariables({
                granularity,
                sub: true,
                subField: "o.orderDate",
                joinConditions: {
                    periodJoinConditionRd: "rd",
                    periodJoinConditionTr: "tr",
                },
            });

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
            WHERE p.period_date BETWEEN :startDate AND :endDate
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
        // Prepare replacements
        const replacements: Record<string, any> = buildDateRange(
            startDate,
            endDate
        );

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
            const {
                intervalUnit,
                selectPeriod,
                groupByPeriod,
                orderByPeriod,
                leftJoinCondition,
            } = getQueryVariables({
                granularity,
                sub: false,
                joinConditions: { leftJoinCondition: "o.orderDate" },
            });

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
            id: SortOrder | null;
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
        } else if (chartType === "line" && granularity === "year") {
            dataFormat["id"] = null;
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
        // Define variables based on granularity
        const {
            intervalUnit,
            selectPeriodMain,
            selectPeriodSub,
            groupByPeriodMain,
            groupByPeriodSub,
            orderByPeriod,
            periodJoinCondition,
        } = getQueryVariables({
            granularity,
            sub: true,
            subField: "o.orderDate",
            joinConditions: { periodJoinCondition: "it" },
        });

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
        const replacements: Record<string, any> = buildDateRange(
            startDate,
            endDate
        );

        // Execute the raw SQL query
        const results = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: replacements,
        });

        // Dynamically create data format

        const dataFormat = { y: "averageQuantityPerOrder" } as {
            id: SortOrder | null;
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
            if (granularity !== "year") {
                dataFormat["id2"] = "year";
            }
        } else if (chartType === "line" && granularity === "year") {
            dataFormat["id"] = null;
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
        // Define variables based on granularity
        const {
            intervalUnit,
            selectPeriodMain,
            selectPeriodSub,
            groupByPeriodMain,
            groupByPeriodSub,
            orderByPeriod,
            periodJoinCondition,
        } = getQueryVariables({
            granularity,
            sub: true,
            subField: "o.orderDate",
            joinConditions: { periodJoinCondition: "it" },
        });

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
        const replacements: Record<string, any> = buildDateRange(
            startDate,
            endDate
        );

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
        let query = "";
        const replacements: Record<string, any> = buildDateRange(
            startDate,
            endDate
        );

        if (granularity === "all") {
            query = `
                WITH region_revenue AS (
                    SELECT
                        ${byState ? "a.stateAbbr AS stateAbbr," : ""}
                        ${byRegion ? `${buildRegionCase("a")} AS region,` : ""}
                        SUM(o.subTotal) as region_period_revenue
                    FROM Orders o
                    JOIN Addresses a ON a.address_id = o.address_id
                    WHERE o.orderDate BETWEEN :startDate AND :endDate
                    GROUP BY
                    ${byState ? "a.stateAbbr" : ""}
                    ${byRegion ? "region" : ""}
                ),
                total_revenue AS (
                    SELECT
                        SUM(o.subTotal) as total_revenue
                    FROM Orders o
                    WHERE o.orderDate BETWEEN :startDate AND :endDate
                )
                SELECT
                    ${byState ? "rr.stateAbbr AS stateAbbr," : ""}
                    ${byRegion ? `rr.region AS region,` : ""}
                    CASE
                        WHEN tr.total_revenue = 0 THEN 0
                        ELSE ROUND((COALESCE(rr.region_period_revenue, 0) / tr.total_revenue) * 100, 2)
                    END AS percentage_of_total
                FROM region_revenue rr
                CROSS JOIN total_revenue tr
                -- WHERE o.orderDate BETWEEN :startDate AND :endDate
                GROUP BY
                ${byState ? "rr.stateAbbr" : ""}
                ${byRegion ? "region" : ""}
            `;
        } else {
            // Define variables based on granularity
            const {
                intervalUnit,
                selectPeriodMain,
                selectPeriodSub,
                groupByPeriodMain,
                groupByPeriodSub,
                orderByPeriod,
                periodJoinConditionRpr,
                periodJoinConditionTr,
            } = getQueryVariables({
                granularity,
                sub: true,
                subField: "o.orderDate",
                joinConditions: {
                    periodJoinConditionRpr: "rpr",
                    periodJoinConditionTr: "tr",
                },
            });

            query = `
            WITH RECURSIVE periods AS (
                SELECT DATE(:startDate) AS period_date
                UNION ALL
                SELECT DATE_ADD(period_date, INTERVAL ${intervalUnit})
                FROM periods
                WHERE period_date < DATE(:endDate)
            ),
            regions AS (
                ${byState ? `SELECT DISTINCT stateAbbr FROM Addresses` : ""}
                ${
                    byRegion
                        ? `
                    SELECT 'Northeast' AS region
                    UNION ALL
                    SELECT 'Southeast'
                    UNION ALL
                    SELECT 'Midwest'
                    UNION ALL
                    SELECT 'Southwest'
                    UNION ALL
                    SELECT 'West'
                    `
                        : ""
                }
            )
            SELECT
                ${selectPeriodMain},
                ${byState ? "r.stateAbbr AS stateAbbr," : ""}
                ${byRegion ? "r.region AS region," : ""}
                COALESCE(rpr.region_period_revenue, 0) AS region_period_revenue,
                COALESCE(tr.total_revenue, 0) AS total_period_revenue,
                CASE
                    WHEN COALESCE(tr.total_revenue, 0) = 0 THEN 0
                    ELSE ROUND((COALESCE(rpr.region_period_revenue, 0) / tr.total_revenue) * 100, 2)
                END AS percentage_of_total
            FROM periods p
            CROSS JOIN regions r
            LEFT JOIN (
                -- Subquery rpr: revenue by state/region per period
                SELECT
                    ${selectPeriodSub},
                    ${byState ? "a.stateAbbr AS stateAbbr," : ""}
                    ${byRegion ? `${buildRegionCase("a")} AS region,` : ""}
                    SUM(o.subTotal) as region_period_revenue
                FROM Orders o
                JOIN Addresses a ON a.address_id = o.address_id
                WHERE o.orderDate BETWEEN :startDate AND :endDate
                GROUP BY ${groupByPeriodSub}
                ${byState ? ", stateAbbr" : ""}
                ${byRegion ? ", region" : ""}
            ) rpr ON
                ${periodJoinConditionRpr}
                ${byState ? "AND r.stateAbbr = rpr.stateAbbr" : ""}
                ${byRegion ? "AND r.region = rpr.region" : ""}
            LEFT JOIN (
                -- Subquery tr: total revenue per period
                SELECT
                    ${selectPeriodSub},
                    SUM(o.subTotal) as total_revenue
                FROM Orders o
                WHERE o.orderDate BETWEEN :startDate AND :endDate
                GROUP BY ${groupByPeriodSub}
            ) tr ON
                ${periodJoinConditionTr}
            WHERE p.period_date BETWEEN :startDate AND :endDate
            GROUP BY ${groupByPeriodMain}
            ${byState ? ", r.stateAbbr" : ""}
            ${byRegion ? ", r.region" : ""}
            ORDER BY ${orderByPeriod}
            `;
        }

        const results = await sequelize.query(query, {
            type: QueryTypes.SELECT,
            replacements: replacements,
        });

        // Dynamically create dataFormat

        const dataFormat = { y: "percentage_of_total" } as {
            id: SortOrder;
            id2?: SortOrder;
            x: SortOrder | "all";
            y: YValue;
        };

        if (chartType === "pie") {
            dataFormat.id = byRegion ? "region" : "stateAbbr";
            dataFormat.x = granularity;
        } else if (granularity !== "all") {
            dataFormat.x = byRegion ? "region" : "stateAbbr";
            dataFormat.id = granularity;
            dataFormat.id2 = granularity === "year" ? undefined : "year";
        } else {
            throw new Error(
                "Invalid granularity and chart type combination. Bar and line charts cannot be used with granularity 'all'"
            );
        }

        const processedResults = buildChartObjects(
            results,
            chartType,
            dataFormat,
            "All time"
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
