/**
 * @description A helper function to define variables used in Analytics SQL queries
 * @param  granularity - the granularity string
 * @param sub - boolean indicating whether there is a sub query
 * @param subField - (Required if sub is true) an optional string representing the field in the subquery
 * @param joinConditions - an object containing join condition variable names as keys and either table aliases or, in the case of leftJoins, whole fields.
 *
 */

interface getQueryVariablesProps {
    granularity: "year" | "quarter" | "month" | "week";
    sub: boolean;
    subField?: string;
    joinConditions: Record<string, string>;
}

const getQueryVariables = (args: getQueryVariablesProps) => {
    if (args.sub && !args.subField) {
        throw new Error("No subfield supplied but sub set to true");
    }

    const variables: Record<string, string> = {};

    Object.keys(args.joinConditions).forEach((key) => {
        if (key === "leftJoinCondition") {
            const field = args.joinConditions[key];
            variables[key] = `YEAR(${field}) = YEAR(p.period_date)`;
        } else {
            const alias = args.joinConditions[key];
            variables[key] = `${alias}.year = YEAR(p.period_date)`;
        }
    });
    variables.orderByPeriod = "YEAR(p.period_date)";
    if (args.sub) {
        variables.selectPeriodMain = "YEAR(p.period_date) AS year";
        variables.selectPeriodSub = `YEAR(${args.subField}) AS year`;
        variables.groupByPeriodMain = "YEAR(p.period_date)";
        variables.groupByPeriodSub = `YEAR(${args.subField})`;
    } else {
        variables.selectPeriod = "YEAR(p.period_date) AS year";
        variables.groupByPeriod = "YEAR(p.period_date)";
    }

    switch (args.granularity) {
        case "year":
            variables.intervalUnit = "1 YEAR";
            break;
        case "quarter":
            variables.intervalUnit = "1 QUARTER";
            variables.orderByPeriod += ", QUARTER(p.period_date)";
            if (args.sub) {
                variables.selectPeriodMain +=
                    ", QUARTER(p.period_date) AS quarter";
                variables.selectPeriodSub += `, QUARTER(${args.subField}) AS quarter`;
                variables.groupByPeriodMain += ", QUARTER(p.period_date)";
                variables.groupByPeriodSub += `, QUARTER(${args.subField})`;
            } else {
                variables.selectPeriod += ", QUARTER(p.period_date) AS quarter";
                variables.groupByPeriod += ", QUARTER(p.period_date)";
            }
            Object.keys(args.joinConditions).forEach((key) => {
                if (key === "leftJoinCondition") {
                    const field = args.joinConditions[key];
                    variables[
                        key
                    ] += ` AND QUARTER(${field}) = QUARTER(p.period_date)`;
                } else {
                    const alias = args.joinConditions[key];
                    variables[
                        key
                    ] += ` AND ${alias}.quarter = QUARTER(p.period_date)`;
                }
            });
            break;
        case "month":
            variables.intervalUnit = "1 MONTH";
            variables.orderByPeriod += ", MONTH(p.period_date)";
            if (args.sub) {
                variables.selectPeriodMain += ", MONTH(p.period_date) AS month";
                variables.selectPeriodSub += `, MONTH(${args.subField}) AS month`;
                variables.groupByPeriodMain += ", MONTH(p.period_date)";
                variables.groupByPeriodSub += `, MONTH(${args.subField})`;
            } else {
                variables.selectPeriod += ", MONTH(p.period_date) AS month";
                variables.groupByPeriod += ", MONTH(p.period_date)";
            }
            Object.keys(args.joinConditions).forEach((key) => {
                if (key === "leftJoinCondition") {
                    const field = args.joinConditions[key];
                    variables[
                        key
                    ] += ` AND MONTH(${field}) = MONTH(p.period_date)`;
                } else {
                    const alias = args.joinConditions[key];
                    variables[
                        key
                    ] += ` AND ${alias}.month = MONTH(p.period_date)`;
                }
            });
            break;
        case "week":
            variables.intervalUnit = "1 WEEK";
            variables.orderByPeriod += ", WEEK(p.period_date, 1)";
            if (args.sub) {
                variables.selectPeriodMain +=
                    ", WEEK(p.period_date, 1) AS week";
                variables.selectPeriodSub += `, WEEK(${args.subField}, 1) AS week`;
                variables.groupByPeriodMain += ", WEEK(p.period_date, 1)";
                variables.groupByPeriodSub += `, WEEK(${args.subField}, 1)`;
            } else {
                variables.selectPeriod += ", WEEK(p.period_date, 1) AS week";
                variables.groupByPeriod += ", WEEK(p.period_date, 1)";
            }
            Object.keys(args.joinConditions).forEach((key) => {
                if (key === "leftJoinCondition") {
                    const field = args.joinConditions[key];
                    variables[
                        key
                    ] += ` AND WEEK(${field}, 1) = WEEK(p.period_date, 1)`;
                } else {
                    const alias = args.joinConditions[key];
                    variables[
                        key
                    ] += ` AND ${alias}.week = WEEK(p.period_date, 1)`;
                }
            });
            break;

        default:
            throw new Error("Invalid granularity");
    }

    return variables;
};

export default getQueryVariables;
