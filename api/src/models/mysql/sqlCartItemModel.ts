import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
    Index,
} from "sequelize-typescript";
import { sqlCart } from "./sqlCartModel.js";
import { sqlProduct } from "./sqlProductModel.js";
import { sqlPromotion } from "./sqlPromotionModel.js";

@Table({
    tableName: "CartItems",
    timestamps: false,
})
export class sqlCartItem extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    cart_item_id!: number;

    @Index
    @ForeignKey(() => sqlCart)
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    cart_id!: number;

    @BelongsTo(() => sqlCart, {
        as: "Cart",
        foreignKey: "cart_id",
        targetKey: "cart_id",
    })
    cart!: sqlCart;

    @ForeignKey(() => sqlProduct)
    @Column({
        type: DataType.STRING(20),
        allowNull: false,
    })
    productNo!: string;

    @BelongsTo(() => sqlProduct, {
        foreignKey: "productNo",
        targetKey: "productNo",
        as: "Product",
    })
    product!: sqlProduct;

    @Column(DataType.STRING)
    thumbnailUrl?: string;

    @ForeignKey(() => sqlPromotion)
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    promotionId?: string;

    @BelongsTo(() => sqlPromotion, {
        as: "Promotion",
        foreignKey: "promotionId",
        targetKey: "promotionId",
    })
    promotion?: sqlPromotion;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    quantity!: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    finalPrice!: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: true,
    })
    reserved!: boolean;
}
