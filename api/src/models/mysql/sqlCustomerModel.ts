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
    declare customer_id: number;

    @ForeignKey(() => sqlUser)
    @Column(DataType.BIGINT)
    declare user_id: number;

    @Column({
        type: DataType.STRING(254),
        allowNull: false,
        unique: true,
    })
    declare email: string;

    @BelongsTo(() => sqlUser, { as: "CustomerUser" })
    declare user: sqlUser;

    @BelongsToMany(() => sqlAddress, () => sqlCustomerAddress)
    declare addresses: sqlAddress[];

    @HasMany(() => sqlOrder)
    declare orders: sqlOrder[];
}
