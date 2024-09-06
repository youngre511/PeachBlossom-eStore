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
    declare subcategory_id: number;

    @Index
    @Column({
        type: DataType.STRING(20),
        allowNull: false,
    })
    declare subcategoryName: string;

    @Index
    @ForeignKey(() => sqlCategory)
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    declare category_id: number;

    @BelongsTo(() => sqlCategory, { as: "Category", foreignKey: "category_id" })
    declare category: sqlCategory[];

    @HasMany(() => sqlProduct, { as: "Product" })
    declare products: sqlProduct[];
}
