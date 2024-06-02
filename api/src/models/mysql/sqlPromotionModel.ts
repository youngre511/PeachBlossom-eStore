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
import { sqlProductPromotion } from "./sqlProductPromotionModel";
import { sqlProduct } from "./sqlProductModel";

@Table({
    tableName: "Promotions",
    timestamps: false,
})
export class sqlPromotion extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    promo_data_id!: number;

    @Index
    @Unique
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    promotionId!: string;

    @Index
    @Column({
        type: DataType.STRING,
        allowNull: true,
    })
    promotionCode?: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    promotionName!: string;

    @Column(DataType.TEXT)
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
        defaultValue: true,
    })
    active!: boolean;

    @BelongsToMany(() => sqlProduct, () => sqlProductPromotion)
    productPromotions!: sqlProductPromotion[];
}
