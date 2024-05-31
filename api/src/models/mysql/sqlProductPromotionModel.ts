import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
} from "sequelize-typescript";
import { sqlPromotion } from "./sqlPromotionModel";
import { sqlProduct } from "./sqlProductModel";

@Table({
    tableName: "ProductPromotions",
    timestamps: false,
})
export class sqlProductPromotion extends Model {
    @ForeignKey(() => sqlProduct)
    @Column(DataType.STRING(20))
    product_number!: string;

    @ForeignKey(() => sqlPromotion)
    @Column(DataType.STRING)
    promotionId!: string;
}
