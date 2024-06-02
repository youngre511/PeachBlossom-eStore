import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    HasMany,
    BelongsTo,
    Index,
} from "sequelize-typescript";
import { sqlCustomer } from "./sqlCustomerModel";
import { sqlCartItem } from "./sqlCartItemModel";

@Table({
    tableName: "Carts",
    timestamps: false,
})
export class sqlCart extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    cart_id!: number;

    @Index
    @ForeignKey(() => sqlCustomer)
    @Column({
        type: DataType.INTEGER,
        allowNull: true,
    })
    customer_id?: number;

    @HasMany(() => sqlCartItem)
    cartItems!: sqlCartItem[];

    @BelongsTo(() => sqlCustomer)
    customer?: sqlCustomer;
}
