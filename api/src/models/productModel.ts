import { Date, Document, Schema, model } from "mongoose";

export interface Promotion {
    promoId: string;
    name: string;
    description: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    startDate: Date;
    endDate: Date;
    active: boolean;
}

export interface ProductItem extends Document {
    _id: Schema.Types.ObjectId;
    productNo: string;
    name: string;
    category: Array<typeof Schema.Types.ObjectId>;
    description: string;
    price: number;
    promotions: Array<Promotion>;
    stock: number;
    images: Array<string>;
    createdAt?: Date;
    updatedAt?: Date;
}

const PromotionSchema: Schema = new Schema(
    {
        promoId: {
            type: Number,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        discountType: {
            type: String,
            required: true,
        },
        discountValue: {
            type: Number,
            required: true,
        },
        startDate: {
            type: Date,
            required: true,
        },
        endDate: {
            type: Date,
            required: true,
        },
        active: {
            type: Boolean,
            default: true,
        },
    },
    { _id: false }
);

const ProductSchema: Schema = new Schema(
    {
        productNo: {
            type: String,
            unique: true,
            required: true,
            immutable: true,
        },
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
        promotions: [PromotionSchema],
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
