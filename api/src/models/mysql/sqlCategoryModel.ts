import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    Index,
    BelongsToMany,
} from "sequelize-typescript";
import { sqlProductCategory } from "./sqlProductCategoryModel";
import { sqlProduct } from "./sqlProductModel";

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

    @BelongsToMany(() => sqlProduct, () => sqlProductCategory)
    productCategories!: sqlProductCategory[];
}
