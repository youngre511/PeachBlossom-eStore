import { Document, Schema, model } from "mongoose";

export interface CategoryItem extends Document {
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const CategorySchema: Schema = new Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true,
        },
    },
    { timestamps: true }
);

const Category = model<CategoryItem>("Category", CategorySchema);

export default Category;
