import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
} from "sequelize-typescript";

@Table({
    tableName: "Customers",
    timestamps: false,
})
export class sqlCustomer extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    customer_id!: number;
}

//INCOMPLETE
