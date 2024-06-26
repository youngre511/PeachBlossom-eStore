import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
} from "sequelize-typescript";
import { sqlPromotion } from "./sqlPromotionModel.js";
import { sqlProduct } from "./sqlProductModel.js";

@Table({
    tableName: "ProductPromotions",
    timestamps: false,
    indexes: [
        {
            fields: ["promotionId", "productNo"],
            name: "idx_promotion_productNo",
            unique: true,
        },
    ],
})
export class sqlProductPromotion extends Model {
    @ForeignKey(() => sqlPromotion)
    @Column(DataType.STRING)
    promotionId!: string;

    @ForeignKey(() => sqlProduct)
    @Column(DataType.STRING(20))
    productNo!: string;
}
