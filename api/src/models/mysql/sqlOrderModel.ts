import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    Default,
} from "sequelize-typescript";
import { sqlCustomer } from "./sqlCustomerModel";

@Table({
    tableName: "Orders",
    timestamps: false,
})
export class sqlOrder extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    order_id!: number;

    @ForeignKey(() => sqlCustomer)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    customer_id!: string;

    @Column({
        type: DataType.STRING(50),
        allowNull: false,
    })
    order_number!: string;

    @Default(DataType.NOW)
    @Column({
        type: DataType.DATE,
    })
    order_date!: Date;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    sub_total!: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    shipping!: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    tax!: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    total_amount!: number;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    shipping_address!: string;

    @Column({
        type: DataType.ENUM(
            "processing",
            "cancelled",
            "ready to ship",
            "shipped",
            "delivered",
            "back ordered"
        ),
    })
    order_status!: string;

    @Column({
        type: DataType.ENUM(
            "unfulfilled",
            "partially fulfilled",
            "fulfilled",
            "on hold",
            "exception"
        ),
    })
    fulfillment_status!: string;
}
