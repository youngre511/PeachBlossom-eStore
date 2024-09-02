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
import { sqlProduct } from "./sqlProductModel.js";
import { sqlSubcategory } from "./sqlSubcategoryModel.js";

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
        type: DataType.STRING(20),
        allowNull: false,
    })
    categoryName!: string;

    @HasMany(() => sqlSubcategory, { as: "Subcategory" })
    subcategory!: sqlSubcategory[];

    @HasMany(() => sqlProduct, { as: "Product" })
    products!: sqlProduct[];
}
