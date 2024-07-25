import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    ForeignKey,
    AutoIncrement,
    BelongsToMany,
} from "sequelize-typescript";
import { sqlCustomer } from "./sqlCustomerModel.js";
import { sqlCustomerAddress } from "./sqlCustomerAddressModel.js";

@Table({
    tableName: "Addresses",
    timestamps: false,
})
export class sqlAddress extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    address_id!: number;

    @Column({
        type: DataType.STRING(255),
        allowNull: true,
    })
    nickname!: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    shippingAddress!: string;

    @Column({
        type: DataType.STRING(60),
        allowNull: false,
    })
    city!: string;

    @Column({
        type: DataType.CHAR(2),
        allowNull: false,
    })
    stateAbbr!: string;

    @Column({
        type: DataType.CHAR(10),
        allowNull: false,
    })
    zipCode!: string;

    @Column({
        type: DataType.STRING(15),
        allowNull: false,
    })
    phoneNumber!: string;

    @BelongsToMany(() => sqlCustomer, () => sqlCustomerAddress)
    customers!: sqlCustomer[];
}
