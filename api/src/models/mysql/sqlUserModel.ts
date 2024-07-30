import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    HasOne,
    HasMany,
    Default,
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
    declare user_id: number;

    @Column({
        type: DataType.STRING(20),
        allowNull: false,
        unique: true,
    })
    declare username: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    declare password: string;

    @Default(true)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    declare defaultPassword: boolean;

    @Column({
        type: DataType.ENUM("customer", "admin"),
        allowNull: false,
    })
    declare role: "customer" | "admin";

    @HasOne(() => sqlCustomer)
    customer?: sqlCustomer;

    @HasOne(() => sqlAdmin)
    admin?: sqlAdmin;
}
