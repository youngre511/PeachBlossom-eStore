import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Index,
    BelongsTo,
    ForeignKey,
    HasMany,
} from "sequelize-typescript";
import { sqlProduct } from "./sqlProductModel.js";
import { sqlCategory } from "./sqlCategoryModel.js";

@Table({
    tableName: "Subcategories",
    timestamps: false,
})
export class sqlSubcategory extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    subcategory_id!: number;

    @Index
    @Column({
        type: DataType.STRING(20),
        allowNull: false,
    })
    subcategoryName!: string;

    @Index
    @ForeignKey(() => sqlCategory)
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    category_id!: number;

    @BelongsTo(() => sqlCategory, { as: "Category", foreignKey: "category_id" })
    category!: sqlCategory[];

    @HasMany(() => sqlProduct, { as: "Product" })
    products!: sqlProduct[];
}
