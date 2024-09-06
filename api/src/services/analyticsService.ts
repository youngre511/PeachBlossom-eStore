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
type SortOrder =
    | "region"
    | "stateAbbr"
    | "year"
    | "quarter"
    | "month"
    | "week"
    | "categoryName"
    | "subcategoryName";

// Data Processing
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

    const stripOfKey = (data: any, key: string) => {
        if (typeof data === "object") {
            delete data[key];
        }
        return data;
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
                    nestedData.push([item[key], [stripOfKey(item, key)]]);
                } else {
                    nestedData[foundIndex][1].push(stripOfKey(item, key));
                }
            }
        } else {
            console.error("Unable to find key for", sortType);
        }
        return nestedData.sort(dynamicSort);
    };

    let sortTypeLength = groupOrder.length;
    const nested1 = nestByType(rawData, groupOrder[0]);

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
    granularity: "week" | "month" | "quarter",
    startDate: string | null,
    endDate: string | null,
    byState: boolean = false,
    byRegion: boolean = false
) => {
    try {
        // Dynamically construct attributes based on granularity input
        const attributeClause: FindAttributeOptions = [];
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
        if (byRegion) {
            // Since sequelize does not support grouping or ordering by dynamically created fields in associated tables, in order to group/order by region, the RAW sql that created the column must be repeated in the group/order clause.
            groupClause.push(literal(regionCaseStatement));
            sortOrder.push("region");
        } else if (byState) {
            groupClause.push("stateAbbr");
            sortOrder.push("stateAbbr");
        }

        groupClause.push("year");
        sortOrder.push("year");
        if (["week", "month", "quarter"].includes(granularity)) {
            groupClause.push(`${granularity}`);
            // SortOrder type must allow all granularity types except "all"
            sortOrder.push(`${granularity}` as SortOrder);
        }

        const results = await sqlOrder.findAll({
            where: whereClause,
            attributes: attributeClause,
            include: includeClause,
            group: groupClause,
            order: ["total_revenue"],
            raw: true,
        });
        const sortedResults = buildNestedDataArrays(sortOrder, results);
        return sortedResults;
    } catch (error) {
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error(
                "Error getting revenue over time: " + error.message
            );
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error("An unknown error occurred while placing order");
        }
    }
};

// Get Revenue by category/subcategory (by region? by state?)

export const getRevenueByCategory = async (
    granularity: "week" | "month" | "quarter" | "year" | "all",
    startDate: string | null,
    endDate: string | null,
    byState: boolean = false,
    byRegion: boolean = false,
    bySubcategory: boolean = false
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
        if (byState || byRegion) {
            orderIncludeClause.push({
                model: sqlAddress,
                as: "Address",
                attributes: [
                    byState
                        ? "stateAbbr"
                        : [literal(regionCaseStatement), "region"],
                ],
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

        // Dynamically create group clause and order clause

        const sortOrder: SortOrder[] = [];
        const groupClause: GroupOption = [];
        console.log("Adding state/region clauses");
        if (byRegion) {
            // Since sequelize does not support grouping or ordering by dynamically created fields in associated tables, in order to group/order by region, the RAW sql that created the column must be repeated in the group/order clause.
            groupClause.push(literal(regionCaseStatement));
            sortOrder.push("region");
        } else if (byState) {
            groupClause.push("stateAbbr");
            sortOrder.push("stateAbbr");
        }

        groupClause.push("categoryName");
        sortOrder.push("categoryName");

        if (bySubcategory) {
            groupClause.push("subcategoryName");
            sortOrder.push("subcategoryName");
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

        const results = await sqlOrderItem.findAll({
            attributes: [
                [
                    fn("SUM", literal("quantity * priceWhenOrdered")),
                    "total_revenue",
                ],
            ],
            include: includeClause,
            group: groupClause,
            order: ["total_revenue"],
            raw: true,
        });
        const sortedResults = buildNestedDataArrays(sortOrder, results);
        return sortedResults;
    } catch (error) {
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error(
                "Error getting revenue over time: " + error.message
            );
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error("An unknown error occurred while placing order");
        }
    }
};

// Get number transactions

export const getTransactionStats = async (
    granularity: "week" | "month" | "quarter" | "year" | "all",
    startDate: string | null,
    endDate: string | null,
    byState: boolean = false,
    byRegion: boolean = false
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
                "Error getting revenue over time: " + error.message
            );
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error("An unknown error occurred while placing order");
        }
    }
};

// Get items per transaction (by region? by state?)
export const getItemsPerTransaction = async (
    granularity: "week" | "month" | "quarter" | "year" | "all",
    startDate: string | null,
    endDate: string | null,
    byState: boolean = false,
    byRegion: boolean = false
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
                            `SUM(quantity) / COUNT(DISTINCT OrderItem.order_id)`
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
            // order: ["averageQuantity"],
            raw: true,
        });
        const sortedResults = buildNestedDataArrays(sortOrder, results);
        return sortedResults;
    } catch (error) {
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error(
                "Error getting revenue over time: " + error.message
            );
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error("An unknown error occurred while placing order");
        }
    }
};

// Get Average Order Value (by region? by state?)

// Get Category Percentages

// Get Region percentages
