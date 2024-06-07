import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Index,
    HasMany,
} from "sequelize-typescript";
import { sqlProduct } from "./sqlProductModel";
import { sqlSubCategory } from "./sqlSubCategoryModel";

@Table({
    tableName: "Categories",
    timestamps: false,
})
export class sqlCategory extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    category_id!: number;

    @Index
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    categoryName!: string;

    @HasMany(() => sqlSubCategory)
    subCategory!: sqlSubCategory[];

    @HasMany(() => sqlProduct)
    products!: sqlProduct[];
}
