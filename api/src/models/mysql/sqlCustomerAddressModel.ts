import {
    Table,
    Column,
    Model,
    DataType,
    ForeignKey,
} from "sequelize-typescript";
import { sqlCustomer } from "./sqlCustomerModel.js";
import { sqlAddress } from "./sqlAddressModel.js";

@Table({
    tableName: "CustomerAddresses",
    timestamps: false,
})
export class sqlCustomerAddress extends Model {
    @ForeignKey(() => sqlCustomer)
    @Column({ type: DataType.BIGINT, primaryKey: true })
    declare customer_id: number;

    @ForeignKey(() => sqlAddress)
    @Column({ type: DataType.BIGINT, primaryKey: true })
    declare address_id: number;

    @Column({ type: DataType.STRING(255), allowNull: true })
    declare nickname: string;
}
