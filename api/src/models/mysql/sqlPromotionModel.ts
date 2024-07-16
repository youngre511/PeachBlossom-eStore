import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    BelongsToMany,
    AutoIncrement,
    Index,
    Unique,
} from "sequelize-typescript";
import { sqlProductPromotion } from "./sqlProductPromotionModel.js";
import { sqlProduct } from "./sqlProductModel.js";

@Table({
    tableName: "Promotions",
    timestamps: false,
})
export class sqlPromotion extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    promo_data_id!: number;

    @Unique
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    promotionId!: string;

    @Index
    @Column({
        type: DataType.STRING(20),
        allowNull: true,
    })
    promotionCode?: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    promotionName!: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    promotionDescription!: string;

    @Column({
        type: DataType.ENUM("percentage", "fixed"),
        allowNull: false,
    })
    discountType!: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    discountValue!: number;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    startDate!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    endDate!: Date;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
    })
    active!: boolean;

    @BelongsToMany(() => sqlProduct, () => sqlProductPromotion)
    productPromotions!: sqlProductPromotion[];
}
