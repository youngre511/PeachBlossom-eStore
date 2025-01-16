import { Document, Schema, model, Types } from "mongoose";

export interface IActivity extends Document {
    _id: Types.ObjectId;
    visitorActivityId: string;
    userId?: number;
    activityType: "productView" | "search" | "cartAdd" | "purchase";
    timestamp: Date;
    productNo?: string;
    searchTerm?: string;
}

const ActivitySchema: Schema = new Schema<IActivity>(
    {
        visitorActivityId: {
            type: String,
            required: true,
        },
        userId: {
            type: Number,
            required: false,
        },
        activityType: {
            type: String,
            enum: ["productView", "search", "cartAdd", "purchase"],
            required: true,
        },

        timestamp: {
            type: Date,
            required: true,
        },
        productNo: {
            type: String,
            validate: {
                validator: function (
                    this: IActivity,
                    value: string | undefined
                ) {
                    // Check if `productNo` is required based on `activityType`
                    if (
                        ["view", "cartAdd", "purchase"].includes(
                            this.activityType
                        )
                    ) {
                        return !!value; // Return true if `productNo` exists
                    }
                    return true; // Not required for other types
                },
                message:
                    "productNo is required for view, cartAdd, and purchase activity types.",
            },
        },
        searchTerm: {
            type: String,
            validate: {
                validator: function (
                    this: IActivity,
                    value: string | undefined
                ) {
                    // Check if `searchTerm` is required based on `activityType`
                    if (this.activityType === "search") {
                        return !!value; // Return true if `searchTerm` exists
                    }
                    return true; // Not required for other types
                },
                message: "searchTerm is required for search activity type.",
            },
        },
    },
    { timestamps: false }
);

ActivitySchema.index({ visitorActivityId: 1, timestamp: -1, activityType: 1 });
ActivitySchema.index({ productNo: 1, activityType: 1, visitorActivityId: 1 });
ActivitySchema.index({
    visitorActivityId: 1,
    searchTerm: 1,
    timestamp: 1,
    activityType: 1,
});
ActivitySchema.index({ userId: 1 });

const Activity = model<IActivity>("Activity", ActivitySchema);

export default Activity;
