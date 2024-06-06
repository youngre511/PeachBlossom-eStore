import { Document, Schema, model } from "mongoose";

export interface TagItem extends Document {
    _id: Schema.Types.ObjectId;
    name: string;
    createdAt?: Date;
    updatedAt?: Date;
}

const TagSchema: Schema = new Schema(
    {
        name: {
            type: String,
            unique: true,
            required: true,
        },
    },
    { timestamps: true }
);

const Tag = model<TagItem>("Tag", TagSchema);

export default Tag;
