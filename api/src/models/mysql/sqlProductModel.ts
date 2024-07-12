import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    ForeignKey,
    Index,
    BelongsTo,
    BelongsToMany,
    HasMany,
    HasOne,
    Default,
} from "sequelize-typescript";
import { sqlCategory } from "./sqlCategoryModel.js";
import { sqlProductPromotion } from "./sqlProductPromotionModel.js";
import { sqlPromotion } from "./sqlPromotionModel.js";
import { sqlCartItem } from "./sqlCartItemModel.js";
import { sqlInventory } from "./sqlInventoryModel.js";
import { sqlSubCategory } from "./sqlSubCategoryModel.js";
import { sqlOrderItem } from "./sqlOrderItemModel.js";

@Table({
    tableName: "Products",
    timestamps: true,
})
export class sqlProduct extends Model {
    @PrimaryKey
    @Column(DataType.BIGINT)
    declare id: number;

    @Index
    @Column({
        type: DataType.STRING(20),
        allowNull: false,
    })
    productNo!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    productName!: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    price!: number;

    @Column({
        type: DataType.TEXT("tiny"),
    })
    description!: string;

    @Index
    @ForeignKey(() => sqlCategory)
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    category_id!: number;

    @BelongsTo(() => sqlCategory, { as: "Category", foreignKey: "category_id" })
    @Index
    @ForeignKey(() => sqlSubCategory)
    @Column({
        type: DataType.BIGINT,
        allowNull: true,
    })
    subCategory_id?: number;

    @BelongsTo(() => sqlSubCategory, {
        as: "SubCategory",
        foreignKey: "subCategory_id",
    })
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    thumbnailUrl?: string;

    @Default(DataType.NOW)
    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare createdAt: Date;

    @Default(DataType.NOW)
    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare updatedAt: Date;

    @Column({
        type: DataType.STRING(10),
        allowNull: false,
    })
    status!: string;

    @BelongsToMany(() => sqlPromotion, () => sqlProductPromotion)
    productPromotions!: sqlProductPromotion[];

    @HasMany(() => sqlCartItem, { as: "CartItem", foreignKey: "productNo" })
    cartItem!: sqlCartItem;

    @HasMany(() => sqlOrderItem, { as: "OrderItem", foreignKey: "productNo" })
    orderItem!: sqlOrderItem;

    @HasOne(() => sqlInventory, { as: "Inventory", foreignKey: "product_id" })
    inventory!: sqlInventory;
}
