import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    ForeignKey,
} from "sequelize-typescript";

import { sqlProduct } from "./sqlProductModel";

@Table({
    tableName: "Inventory",
    timestamps: true,
})
export class sqlInventory extends Model {
    @PrimaryKey
    @ForeignKey(() => sqlProduct)
    @Column(DataType.STRING(20))
    product_number!: string;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    quantity!: number;
}
