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
    order_item_id!: number;

    @Index
    @ForeignKey(() => sqlOrder)
    @Column(DataType.BIGINT)
    order_id!: number;

    @ForeignKey(() => sqlProduct)
    @Column(DataType.STRING(20))
    productNo!: string;

    @BelongsTo(() => sqlProduct, {
        foreignKey: "productNo",
        targetKey: "productNo",
        as: "Product",
    })
    product!: sqlProduct;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        defaultValue: 1,
    })
    quantity!: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    priceWhenOrdered!: number;

    @Index
    @Column({
        type: DataType.ENUM(
            "unfulfilled",
            "partially fulfilled",
            "fulfilled",
            "back ordered",
            "on hold",
            "exception"
        ),
    })
    fulfillmentStatus!: string;
}
