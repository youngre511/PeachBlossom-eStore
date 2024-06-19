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
    Unique,
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
    @Unique
    @ForeignKey(() => sqlCustomer)
    @Column({
        type: DataType.BIGINT,
        allowNull: true,
    })
    customer_id?: number;

    @HasMany(() => sqlCartItem, { as: "CartItem", foreignKey: "cart_id" })
    cartItems!: sqlCartItem[];

    @BelongsTo(() => sqlCustomer, {
        as: "Customer",
        foreignKey: "customer_id",
        targetKey: "customer_id",
    })
    customer?: sqlCustomer;
}
