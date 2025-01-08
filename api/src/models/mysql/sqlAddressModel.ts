import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    ForeignKey,
    AutoIncrement,
    BelongsToMany,
    HasMany,
} from "sequelize-typescript";
import { sqlCustomer } from "./sqlCustomerModel.js";
import { sqlCustomerAddress } from "./sqlCustomerAddressModel.js";
import { sqlOrder } from "./sqlOrderModel.js";

@Table({
    tableName: "Addresses",
    timestamps: false,
})
export class sqlAddress extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    declare address_id: number;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    declare shippingAddress: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    declare firstName: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    declare lastName: string;

    @Column({
        type: DataType.STRING(60),
        allowNull: false,
    })
    declare city: string;

    @Column({
        type: DataType.CHAR(2),
        allowNull: false,
    })
    declare stateAbbr: string;

    @Column({
        type: DataType.CHAR(10),
        allowNull: false,
    })
    declare zipCode: string;

    @Column({
        type: DataType.STRING(15),
        allowNull: false,
    })
    declare phoneNumber: string;

    @BelongsToMany(() => sqlCustomer, () => sqlCustomerAddress)
    declare customers: sqlCustomer[];

    @HasMany(() => sqlOrder, { as: "Order", foreignKey: "address_id" })
    declare order: sqlOrder;
}
