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
    Unique,
} from "sequelize-typescript";
import { sqlCategory } from "./sqlCategoryModel";
import { sqlProductPromotion } from "./sqlProductPromotionModel";
import { sqlPromotion } from "./sqlPromotionModel";
import { sqlCartItem } from "./sqlCartItemModel";
import { sqlInventory } from "./sqlInventoryModel";
import { sqlSubCategory } from "./sqlSubCategoryModel";

@Table({
    tableName: "Products",
    timestamps: false,
})
export class sqlProduct extends Model {
    @PrimaryKey
    @Column(DataType.BIGINT)
    id!: number;

    @Index
    @Unique
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
    @ForeignKey(() => sqlSubCategory)
    @Column({
        type: DataType.BIGINT,
        allowNull: true,
    })
    subCategory_id?: number;

    @BelongsTo(() => sqlSubCategory)
    @Index
    @ForeignKey(() => sqlCategory)
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    category_id!: number;

    @BelongsTo(() => sqlCategory)
    @BelongsToMany(() => sqlPromotion, () => sqlProductPromotion)
    productPromotions!: sqlProductPromotion[];

    @HasMany(() => sqlCartItem)
    cartItem!: sqlCartItem;

    @HasOne(() => sqlInventory)
    inventory!: sqlInventory;
}
