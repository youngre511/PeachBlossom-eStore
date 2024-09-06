import "sequelize";

declare module "sequelize" {
    // Sequelize's default GroupOption type does not allow the inclusion of literals. The underlying sql, however, does.
    // Expanding the type definition gets around that constraint so that it's possible to include fields dynamically created in nested tables when writing grouping clauses for find queries
    type GroupOption =
        | string
        | fn
        | col
        | Literal
        | (string | fn | col | Literal)[];
}
