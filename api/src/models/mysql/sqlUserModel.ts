import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    HasOne,
    HasMany,
} from "sequelize-typescript";
import { sqlCustomer } from "./sqlCustomerModel.js";
import { sqlAdmin } from "./sqlAdminModel.js";

@Table({
    tableName: "Users",
    timestamps: false,
})
export class sqlUser extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    user_id!: number;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        unique: true,
    })
    username!: string;

    @Column({
        type: DataType.STRING(90),
        allowNull: false,
    })
    password!: string;

    @Column({
        type: DataType.ENUM("customer", "admin"),
        allowNull: false,
    })
    role!: "customer" | "admin";

    @HasOne(() => sqlCustomer)
    customer?: sqlCustomer;

    @HasOne(() => sqlAdmin)
    admin?: sqlAdmin;
}
