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
import { Transaction } from "sequelize";

export interface AddAddressOptions {
    transaction: Transaction;
    through?: { nickname: string };
}

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

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    declare firstName: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    declare lastName: string;

    @BelongsTo(() => sqlUser, { as: "CustomerUser" })
    declare user: sqlUser;

    @BelongsToMany(() => sqlAddress, () => sqlCustomerAddress)
    declare addresses: sqlAddress[];

    declare addAddress: (
        address: sqlAddress | number,
        options: AddAddressOptions
    ) => Promise<void>;

    declare removeAddress: (
        address_id: number,
        options: { transaction: Transaction }
    ) => Promise<void>;

    @HasMany(() => sqlOrder)
    declare orders: sqlOrder[];
}
