import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
} from "sequelize-typescript";

@Table({
    tableName: "Categories",
    timestamps: false,
})
export class sqlCategory extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    category_id!: number;

    @Column({
        type: DataType.STRING,
        allowNull: false,
    })
    category_name!: string;
}
