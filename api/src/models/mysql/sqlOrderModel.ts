import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    Default,
    HasMany,
    Index,
    Unique,
} from "sequelize-typescript";
import { sqlCustomer } from "./sqlCustomerModel.js";
import { sqlOrderItem } from "./sqlOrderItemModel.js";

@Table({
    tableName: "Orders",
    timestamps: false,
})
export class sqlOrder extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    order_id!: number;

    @ForeignKey(() => sqlCustomer)
    @Column({
        type: DataType.BIGINT,
        allowNull: true,
    })
    customer_id!: number;

    @Unique
    @Column({
        type: DataType.STRING(50),
        allowNull: false,
    })
    orderNo!: string;

    @Default(DataType.NOW)
    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    orderDate!: Date;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    subTotal!: number;

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
    totalAmount!: number;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    shippingAddress!: string;

    @Column({
        type: DataType.STRING(60),
        allowNull: false,
    })
    city!: string;

    @Column({
        type: DataType.CHAR(2),
        allowNull: false,
    })
    stateAbbr!: string;

    @Column({
        type: DataType.CHAR(10),
        allowNull: false,
    })
    zipCode!: string;

    @Column({
        type: DataType.STRING(15),
        allowNull: false,
    })
    phoneNumber!: string;

    @Column({
        type: DataType.STRING(254),
        allowNull: false,
    })
    email!: string;

    @Column({
        type: DataType.ENUM(
            "in process",
            "cancelled",
            "ready to ship",
            "shipped",
            "delivered",
            "back ordered"
        ),
        allowNull: false,
    })
    orderStatus!: string;

    @HasMany(() => sqlOrderItem, { as: "OrderItem" })
    orderItems!: sqlOrderItem[];
}
