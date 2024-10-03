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
    BelongsTo,
} from "sequelize-typescript";
import { sqlCustomer } from "./sqlCustomerModel.js";
import { sqlOrderItem } from "./sqlOrderItemModel.js";
import { sqlAddress } from "./sqlAddressModel.js";

@Table({
    tableName: "Orders",
    timestamps: false,
})
export class sqlOrder extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    declare order_id: number;

    @ForeignKey(() => sqlCustomer)
    @Column({
        type: DataType.BIGINT,
        allowNull: true,
    })
    declare customer_id: number;

    @BelongsTo(() => sqlCustomer, { as: "Customer", foreignKey: "customer_id" })
    declare customer: sqlCustomer;

    @Unique
    @Column({
        type: DataType.STRING(50),
        allowNull: false,
    })
    declare orderNo: string;

    @Default(DataType.NOW)
    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare orderDate: Date;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    declare subTotal: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    declare shipping: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    declare tax: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    declare totalAmount: number;

    @ForeignKey(() => sqlAddress)
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    declare address_id: number;

    @BelongsTo(() => sqlAddress, { as: "Address", foreignKey: "address_id" })
    declare address: sqlAddress;

    @Column({
        type: DataType.STRING(254),
        allowNull: false,
    })
    declare email: string;

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
    declare orderStatus: string;

    @HasMany(() => sqlOrderItem, { as: "OrderItem" })
    declare orderItems: sqlOrderItem[];
}
