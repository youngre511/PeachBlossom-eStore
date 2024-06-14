import { Document, Schema, model } from "mongoose";

export interface SubCategoryItem {
    _id: Schema.Types.ObjectId;
    name: string;
}
export interface CategoryItem extends Document {
    _id: Schema.Types.ObjectId;
    name: string;
    subCategories: SubCategoryItem[];
    createdAt?: Date;
    updatedAt?: Date;
}

const SubCategorySchema: Schema = new Schema({
    _id: { type: Schema.Types.ObjectId, auto: false },
    name: {
        type: String,
        unique: true,
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
        subCategories: [SubCategorySchema],
    },
    { timestamps: true }
);

const Category = model<CategoryItem>("Category", CategorySchema);

export default Category;
