import { Date, Document, Schema, model } from "mongoose";

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

interface Attributes {
    color:
        | "red"
        | "orange"
        | "yellow"
        | "green"
        | "blue"
        | "purple"
        | "pink"
        | "gold"
        | "silver"
        | "white"
        | "gray"
        | "black"
        | "brown"
        | "cream"
        | "beige"
        | "multicolor"
        | "clear";
    material:
        | "glass"
        | "plastic"
        | "ceramic"
        | "metal"
        | "wood"
        | "fabric"
        | "leather"
        | "stone"
        | "rubber"
        | "resin"
        | "natural fiber"
        | "bamboo";
    size: "small" | "medium" | "large";
    // Dimensions in inches
    weight: number;
    dimensions: {
        width: number;
        height: number;
        depth: number;
        diameter: number;
        circumference: number;
    };
}

const AttributesSchema: Schema = new Schema({
    color: {
        type: String,
        required: true,
    },
    material: {
        type: String,
    },
    size: {
        type: String,
    },
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
        diameter: {
            type: Number,
        },
        circumference: {
            type: Number,
        },
    },
});

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
        tags: [
            {
                type: Schema.Types.ObjectId,
                ref: "Tag",
            },
        ],
    },
    { timestamps: true }
);

const Product = model<ProductItem>("Product", ProductSchema);

export default Product;
