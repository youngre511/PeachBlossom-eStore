import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    ForeignKey,
    HasMany,
} from "sequelize-typescript";
import { sqlCategory } from "./sqlCategoryModel";
import { sqlProductPromotion } from "./sqlProductPromotionModel";

@Table({
    tableName: "Products",
    timestamps: false,
})
export class sqlProduct extends Model {
    @PrimaryKey
    @Column({
        type: DataType.STRING(20),
        allowNull: false,
    })
    product_number!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    product_name!: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    price!: number;

    @ForeignKey(() => sqlCategory)
    @Column(DataType.INTEGER)
    category_id!: number;

    @Column({
        type: DataType.TEXT("tiny"),
    })
    description!: string;

    @HasMany(() => sqlProductPromotion)
    productPromotions!: sqlProductPromotion[];
}
