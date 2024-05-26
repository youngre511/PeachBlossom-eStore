import { Document, Schema, model } from "mongoose";

export interface ProductItem extends Document {
    name: string;
    category: Array<typeof Schema.Types.ObjectId>;
    description: string;
    price: number;
    stock: number;
    images: Array<string>;
    createdAt?: Date;
    updatedAt?: Date;
}

const ProductSchema: Schema = new Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true,
        },
        category: [
            {
                type: Schema.Types.ObjectId,
                ref: "Category",
            },
        ],
        description: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
            default: 0,
        },
        stock: {
            type: Number,
            required: true,
            default: 0,
        },
        images: [
            {
                type: String,
            },
        ],
    },
    { timestamps: true }
);

const Product = model<ProductItem>("Product", ProductSchema);

export default Product;
