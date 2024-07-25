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
    @Column(DataType.BIGINT)
    customer_id!: number;

    @ForeignKey(() => sqlAddress)
    @Column(DataType.BIGINT)
    address_id!: number;
}
