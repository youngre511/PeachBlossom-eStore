import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    HasMany,
} from "sequelize-typescript";
import { sqlProductPromotion } from "./sqlProductPromotionModel";

@Table({
    tableName: "Promotions",
    timestamps: false,
})
export class sqlPromotion extends Model {
    @PrimaryKey
    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    promotionId!: string;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    promotion_name!: string;

    @Column(DataType.TEXT)
    promotion_description!: string;

    @Column({
        type: DataType.ENUM("percentage", "fixed"),
        allowNull: false,
    })
    discount_type!: string;

    @Column({
        type: DataType.DECIMAL(10, 2),
        allowNull: false,
    })
    discount_value!: number;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    start_date!: Date;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    end_date!: Date;

    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    })
    active!: boolean;

    @HasMany(() => sqlProductPromotion)
    productPromotions!: sqlProductPromotion[];
}
