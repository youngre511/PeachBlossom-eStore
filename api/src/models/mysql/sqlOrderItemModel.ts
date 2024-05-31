import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
} from "sequelize-typescript";
import { sqlPromotion } from "./sqlPromotionModel";
import { sqlProduct } from "./sqlProductModel";
import { sqlOrder } from "./sqlOrderModel";

@Table({
    tableName: "OrderItems",
    timestamps: false,
})
export class sqlOrderItem extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column({
        type: DataType.INTEGER,
    })
    order_item_id!: number;

    @ForeignKey(() => sqlOrder)
    @Column(DataType.INTEGER)
    order_id!: number;

    @ForeignKey(() => sqlProduct)
    @Column(DataType.STRING(20))
    product_number!: string;

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
    price_when_ordered!: number;
}
