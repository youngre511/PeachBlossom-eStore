import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
    BelongsTo,
} from "sequelize-typescript";
import { sqlUser } from "./sqlUserModel.js";

@Table({
    tableName: "Admins",
    timestamps: false,
})
export class sqlAdmin extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    declare admin_id: number;

    @ForeignKey(() => sqlUser)
    @Column(DataType.BIGINT)
    declare user_id: number;

    @Column({
        type: DataType.ENUM("full", "limited"),
        allowNull: false,
    })
    declare accessLevel: "full" | "limited";

    @BelongsTo(() => sqlUser, { as: "AdminUser" })
    declare user: sqlUser;
}
