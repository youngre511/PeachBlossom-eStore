import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    BelongsTo,
    ForeignKey,
    Default,
    CreatedAt,
} from "sequelize-typescript";
import { sqlUser } from "./sqlUserModel.js";

@Table({
    tableName: "RefreshTokens",
    timestamps: false,
})
export class sqlRefreshToken extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.BIGINT)
    declare token_id: number;

    @ForeignKey(() => sqlUser)
    @Column({
        type: DataType.BIGINT,
        allowNull: false,
    })
    declare user_id: number;

    @BelongsTo(() => sqlUser, { as: "User", foreignKey: "user_id" })
    user!: sqlUser[];

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    declare token: string;

    @Column({
        type: DataType.STRING(255),
        allowNull: false,
    })
    declare jti: string;

    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare expires_at: Date;

    @Default(false)
    @Column({
        type: DataType.BOOLEAN,
        allowNull: false,
    })
    declare revoked: boolean;

    @CreatedAt
    @Default(DataType.NOW())
    @Column({
        type: DataType.DATE,
        allowNull: false,
    })
    declare created_at: Date;
}
