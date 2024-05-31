import {
    Table,
    Column,
    Model,
    DataType,
    PrimaryKey,
    AutoIncrement,
    ForeignKey,
} from "sequelize-typescript";
import { sqlCart } from "./sqlCartModel";
import { sqlProduct } from "./sqlProductModel";

@Table({
    tableName: "Categories",
    timestamps: false,
})
export class sqlCategory extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column(DataType.INTEGER)
    cart_item_id!: number;

    @ForeignKey(() => sqlCart)
    @Column(DataType.INTEGER)
    cart_id!: number;

    @ForeignKey(() => sqlProduct)
    @Column(DataType.STRING(20))
    product_number!: string;

    @Column(DataType.INTEGER)
    quantity!: number;
}
