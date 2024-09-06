import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    Index,
    BelongsTo,
} from "sequelize-typescript";
import { sqlProduct } from "./sqlProductModel.js";
import { sqlOrder } from "./sqlOrderModel.js";

@Table({
    tableName: "OrderItems",
    timestamps: false,
})
export class sqlOrderItem extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.BIGINT,
    })
    declare order_item_id: number;

    @Index
    @ForeignKey(() => sqlOrder)
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    declare order_id: number;

    @BelongsTo(() => sqlOrder, {
        foreignKey: "order_id",
        targetKey: "order_id",
        as: "Order",
    })
    declare order: sqlProduct;

    @ForeignKey(() => sqlProduct)
    @Column({
        type: DataType.STRING(20),
        allowNull: false,
    })
    declare productNo: string;

    @BelongsTo(() => sqlProduct, {
        foreignKey: "productNo",
        targetKey: "productNo",
        as: "Product",
    })
    declare product: sqlProduct;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1,
    })
    declare quantity: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    declare priceWhenOrdered: number;

    @Index
    @Column({
        type: DataType.ENUM(
            "unfulfilled",
            "partially fulfilled",
            "fulfilled",
            "back ordered",
            "on hold",
            "cancelled",
            "exception"
        ),
        allowNull: false,
    })
    declare fulfillmentStatus: string;
}
