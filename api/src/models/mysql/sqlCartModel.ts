import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
} from "sequelize-typescript";
import { sqlCustomer } from "./sqlCustomerModel";

@Table({
    tableName: "Carts",
    timestamps: false,
})
export class sqlCart extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    cart_id!: number;

    @ForeignKey(() => sqlCustomer)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    customer_id!: number;
}
