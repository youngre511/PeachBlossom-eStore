import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    BelongsTo,
    ForeignKey,
    BelongsToMany,
    HasMany,
} from "sequelize-typescript";
import { sqlUser } from "./sqlUserModel.js";
import { sqlAddress } from "./sqlAddressModel.js";
import { sqlCustomerAddress } from "./sqlCustomerAddressModel.js";
import { sqlOrder } from "./sqlOrderModel.js";

@Table({
    tableName: "Customers",
    timestamps: false,
})
export class sqlCustomer extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    customer_id!: number;

    @ForeignKey(() => sqlUser)
    @Column(DataType.BIGINT)
    user_id!: number;

    @Column({
        type: DataType.STRING(254),
        allowNull: false,
        unique: true,
    })
    email!: string;

    @BelongsTo(() => sqlUser, { as: "CustomerUser" })
    user!: sqlUser;

    @BelongsToMany(() => sqlAddress, () => sqlCustomerAddress)
    addresses!: sqlAddress[];

    @HasMany(() => sqlOrder)
    orders!: sqlOrder[];
}
