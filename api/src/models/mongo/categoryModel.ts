import { Document, Schema, model, Types } from "mongoose";

export interface SubcategoryItem {
    _id: Types.ObjectId;
    name: string;
}
export interface CategoryItem extends Document {
    _id: Schema.Types.ObjectId;
    name: string;
    subcategories: SubcategoryItem[];
    createdAt?: Date;
    updatedAt?: Date;
}

const SubcategorySchema: Schema = new Schema({
    _id: { type: Schema.Types.ObjectId, auto: false },
    name: {
        type: String,
        required: true,
    },
});

const CategorySchema: Schema = new Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true,
        },
        subcategories: [SubcategorySchema],
    },
    { timestamps: true }
);

CategorySchema.index(
    { "subcategories.name": 1 },
    {
        unique: true,
        partialFilterExpression: { "subcategories.name": { $exists: true } },
    }
);

const Category = model<CategoryItem>("Category", CategorySchema);

export default Category;
