import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    ForeignKey,
    AutoIncrement,
    BelongsTo,
    Index,
    Unique,
} from "sequelize-typescript";

import { sqlProduct } from "./sqlProductModel.js";

@Table({
    tableName: "Inventory",
    timestamps: true,
})
export class sqlInventory extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    declare inventory_id: number;

    @Unique
    @ForeignKey(() => sqlProduct)
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    declare product_id: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    declare stock: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    declare reserved: number;

    @Column({
        type: DataType.VIRTUAL,
        get() {
            return this.getDataValue("stock") - this.getDataValue("reserved");
        },
        set(value: number) {
            throw new Error("Do not try to set the 'available' value");
        },
    })
    declare available: number;

    @BelongsTo(() => sqlProduct, {
        as: "Product",
        foreignKey: "product_id",
        targetKey: "id",
    })
    declare product: sqlProduct;
}
