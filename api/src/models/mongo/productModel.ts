import { Date, Document, Schema, model, Types } from "mongoose";
import { CategoryItem } from "./categoryModel.js";

export interface Promotion {
    promoId: string;
    name: string;
    description: string;
    discountType: "percentage" | "fixed";
    discountValue: number;
    startDate: string;
    endDate: string;
    active: boolean;
}

export interface ProductItem extends Document {
    _id: Types.ObjectId;
    productNo: string;
    name: string;
    category: Types.ObjectId;
    subcategory: Types.ObjectId;
    description: string;
    attributes: Attributes;
    price: number;
    promotions: Array<Promotion>;
    stock: number;
    tags: string[];
    status: string;
    images: Array<string>;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface PopulatedProductItem extends Document {
    _id: Types.ObjectId;
    productNo: string;
    name: string;
    category: CategoryItem;
    subcategory: Types.ObjectId;
    description: string;
    attributes: Attributes;
    price: number;
    promotions: Array<Promotion>;
    stock: number;
    tags: string[];
    status: string;
    images: Array<string>;
    createdAt?: Date;
    updatedAt?: Date;
}

export const colorsList = [
    "red",
    "orange",
    "yellow",
    "green",
    "blue",
    "purple",
    "pink",
    "gold",
    "silver",
    "white",
    "gray",
    "black",
    "brown",
    "cream",
    "beige",
    "multicolor",
    "clear",
] as const;

export const materialsList = [
    "glass",
    "plastic",
    "ceramic",
    "metal",
    "wood",
    "fabric",
    "leather",
    "stone",
    "rubber",
    "resin",
    "natural fiber",
    "bamboo",
] as const;

export type Color = (typeof colorsList)[number];
export type Material = (typeof materialsList)[number];
export interface Attributes {
    color: Color;
    material: Material[];
    // Dimensions in inches
    weight: number;
    dimensions: {
        width: number;
        height: number;
        depth: number;
    };
}

const AttributesSchema: Schema = new Schema(
    {
        color: {
            type: String,
            required: true,
        },
        material: [
            {
                type: String,
            },
        ],
        weight: {
            type: Number,
            required: true,
        },
        dimensions: {
            width: {
                type: Number,
            },
            height: {
                type: Number,
            },
            depth: {
                type: Number,
            },
        },
    },
    { _id: false }
);

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
            type: String,
            required: true,
        },
        endDate: {
            type: String,
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
        category: {
            type: Schema.Types.ObjectId,
            ref: "Category",
        },
        subcategory: {
            type: Schema.Types.ObjectId,
            ref: "Category.subcategories",
        },
        tags: [
            {
                type: Schema.Types.ObjectId,
                ref: "Tag",
            },
        ],
        description: {
            type: String,
            required: true,
        },
        attributes: AttributesSchema,
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
        status: {
            type: String,
            default: "active",
        },
    },
    { timestamps: true }
);

const Product = model<ProductItem>("Product", ProductSchema);

export default Product;
