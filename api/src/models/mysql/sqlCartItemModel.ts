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
import { sqlCart } from "./sqlCartModel";
import { sqlProduct } from "./sqlProductModel";
import { sqlPromotion } from "./sqlPromotionModel";

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
    @Column(DataType.BIGINT)
    cart_id!: number;

    @BelongsTo(() => sqlCart, {
        as: "Cart",
        foreignKey: "cart_id",
        targetKey: "cart_id",
    })
    cart!: sqlCart;

    @ForeignKey(() => sqlProduct)
    @Column(DataType.STRING(20))
    productNo!: string;

    @BelongsTo(() => sqlProduct, {
        foreignKey: "productNo",
        targetKey: "productNo",
        as: "Product",
    })
    product!: sqlProduct;

    @Column(DataType.STRING(50))
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

    @Column(DataType.INTEGER)
    quantity!: number;

    @Column(DataType.DECIMAL(10, 2))
    finalPrice!: number;

    @Column(DataType.BOOLEAN)
    reserved!: boolean;
}
