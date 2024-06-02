import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
} from "sequelize-typescript";
import { sqlProduct } from "./sqlProductModel";
import { sqlCategory } from "./sqlCategoryModel";

@Table({
    tableName: "ProductCategories",
    timestamps: false,
    indexes: [
        {
            fields: ["categoryName", "productNo"],
            name: "idx_category_product",
            unique: true,
        },
    ],
})
export class sqlProductCategory extends Model {
    @ForeignKey(() => sqlCategory)
    @Column(DataType.STRING)
    categoryName!: string;

    @ForeignKey(() => sqlProduct)
    @Column(DataType.STRING(20))
    productNo!: string;
}
