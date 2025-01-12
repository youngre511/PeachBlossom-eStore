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
    declare promo_data_id: number;

    @Unique
    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    declare promotionId: string;

    @Index
    @Column({
        type: DataType.STRING(20),
        allowNull: true,
    })
    declare promotionCode?: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    declare promotionName: string;

    @Column({
        type: DataType.TEXT,
        allowNull: true,
    })
    declare promotionDescription: string;

    @Column({
        type: DataType.ENUM("percentage", "fixed"),
        allowNull: false,
    })
    declare discountType: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    declare discountValue: number;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare startDate: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare endDate: Date;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: 1,
    })
    declare active: boolean;

    @BelongsToMany(() => sqlProduct, () => sqlProductPromotion)
    declare products: sqlProduct[];
}
