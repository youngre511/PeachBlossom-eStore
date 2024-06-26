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
    inventory_id!: number;

    @Unique
    @ForeignKey(() => sqlProduct)
    @Column(DataType.BIGINT)
    product_id!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    stock!: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 0,
    })
    reserved!: number;

    @Column({
        type: DataType.VIRTUAL,
        get() {
            return this.getDataValue("stock") - this.getDataValue("reserved");
        },
        set(value: number) {
            throw new Error("Do not try to set the 'available' value");
        },
    })
    available!: number;

    @BelongsTo(() => sqlProduct, {
        as: "Product",
        foreignKey: "product_id",
        targetKey: "id",
    })
    product!: sqlProduct;
}
