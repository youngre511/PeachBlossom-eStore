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
import { sqlProduct } from "./sqlProductModel";
import { sqlCategory } from "./sqlCategoryModel";

@Table({
    tableName: "SubCategories",
    timestamps: false,
})
export class sqlSubCategory extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    subCategory_id!: number;

    @Index
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    subCategoryName!: string;

    @Index
    @ForeignKey(() => sqlCategory)
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    category_id!: number;

    @BelongsTo(() => sqlCategory)
    category!: sqlCategory[];

    @HasMany(() => sqlProduct)
    products!: sqlProduct[];
}
