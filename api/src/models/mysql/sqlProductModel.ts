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
    AutoIncrement,
} from "sequelize-typescript";
import { sqlCategory } from "./sqlCategoryModel.js";
import { sqlProductPromotion } from "./sqlProductPromotionModel.js";
import { sqlPromotion } from "./sqlPromotionModel.js";
import { sqlCartItem } from "./sqlCartItemModel.js";
import { sqlInventory } from "./sqlInventoryModel.js";
import { sqlSubcategory } from "./sqlSubcategoryModel.js";
import { sqlOrderItem } from "./sqlOrderItemModel.js";

@Table({
    tableName: "Products",
    timestamps: true,
})
export class sqlProduct extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    declare id: number;

    @Index
    @Column({
        type: DataType.STRING(20),
        allowNull: false,
    })
    declare productNo: string;

    @Column({
        type: DataType.STRING(100),
        allowNull: false,
    })
    declare productName: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    declare price: number;

    @Column({
        type: DataType.TEXT("tiny"),
        allowNull: false,
    })
    declare description: string;

    @Index
    @ForeignKey(() => sqlCategory)
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    declare category_id: number;

    @BelongsTo(() => sqlCategory, { as: "Category", foreignKey: "category_id" })
    @Index
    @ForeignKey(() => sqlSubcategory)
    @Column({
        type: DataType.BIGINT,
        allowNull: true,
    })
    declare subcategory_id?: number;

    @BelongsTo(() => sqlSubcategory, {
        as: "Subcategory",
        foreignKey: "subcategory_id",
    })
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    declare thumbnailUrl?: string;

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
        type: DataType.ENUM("active", "discontinued"),
        allowNull: false,
    })
    declare status: string;

    @BelongsToMany(() => sqlPromotion, () => sqlProductPromotion)
    declare productPromotions: sqlProductPromotion[];

    @HasMany(() => sqlCartItem, { as: "CartItem", foreignKey: "productNo" })
    declare cartItem: sqlCartItem;

    @HasMany(() => sqlOrderItem, { as: "OrderItem", foreignKey: "productNo" })
    declare orderItem: sqlOrderItem;

    @HasOne(() => sqlInventory, { as: "Inventory", foreignKey: "product_id" })
    declare inventory: sqlInventory;
}
