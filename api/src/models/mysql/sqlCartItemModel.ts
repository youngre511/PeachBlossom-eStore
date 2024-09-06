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
    declare cart_item_id: number;

    @Index
    @ForeignKey(() => sqlCart)
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    declare cart_id: number;

    @BelongsTo(() => sqlCart, {
        as: "Cart",
        foreignKey: "cart_id",
        targetKey: "cart_id",
    })
    declare cart: sqlCart;

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

    @Column(DataType.STRING)
    declare thumbnailUrl?: string;

    @ForeignKey(() => sqlPromotion)
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare promotionId?: string;

    @BelongsTo(() => sqlPromotion, {
        as: "Promotion",
        foreignKey: "promotionId",
        targetKey: "promotionId",
    })
    declare promotion?: sqlPromotion;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
    })
    declare quantity: number;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    declare finalPrice: number;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: true,
    })
    declare reserved: boolean;
}
