import type { ClientSession, PipelineStage } from "mongoose";
import Activity, { IActivity } from "../models/mongo/activityModel.js";
import { generateActivityId } from "../utils/generateActivityId.js";
import { getIdFromUsername } from "./userService.js";
import {
    ProductInteractionLog,
    SearchLog,
} from "../controllers/activityController.js";
import mongoose from "mongoose";

export const assignTrackingId = async (username?: string) => {
    try {
        let trackingId;
        if (username) {
            const userId = await getIdFromUsername(username);
            if (userId) {
                const record = await Activity.findOne({
                    userId,
                });
                if (record) {
                    trackingId = record.trackingId;
                }
            }
        }
        if (!trackingId) {
            trackingId = await generateActivityId();
        }

        return trackingId;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Error assigning tracking id: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while assigning a tracking id"
            );
        }
    }
};

export const logActivity = async (
    activity: Array<ProductInteractionLog | SearchLog>,
    trackingId: string,
    userId?: number
) => {
    const session: ClientSession = await mongoose.startSession();
    session.startTransaction();

    try {
        const newLogs = activity.map(
            (record: SearchLog | ProductInteractionLog): IActivity => ({
                trackingId,
                userId,
                activityType: record.activityType,
                productNo: "productNo" in record ? record.productNo : undefined,
                searchTerm:
                    "searchTerm" in record ? record.searchTerm : undefined,
                timestamp: record.timestamp,
            })
        );

        const result = await Activity.insertMany(newLogs, { session });

        await session.commitTransaction();

        return result.length;
    } catch (error) {
        await session.abortTransaction();
        if (error instanceof Error) {
            console.error("Error logging activity: " + error.message);
            throw new Error("Error logging activity: " + error.message);
        } else {
            throw new Error("An unknown error occurred while logging activity");
        }
    } finally {
        await session.endSession();
    }
};

export const mapSearchToCart = async () => {
    const pipeline: PipelineStage[] = [
        //Match "search" and "CartAdd" activities
        {
            $match: {
                activityType: { $in: ["search", "cartAdd"] },
            },
        },
        // Sort by activity id and timestamp
        {
            $sort: { visitorActivityId: 1, timestamp: 1 },
        },
        // Group by id
        {
            $group: {
                _id: "$trackingId",
                activities: {
                    $push: {
                        productNo: "$productNo",
                        searchTerm: "$searchTerm",
                        timestamp: "$timestamp",
                    },
                },
            },
        },
        // Match search to cartAdd if cart add follows immediately and occurs within 10 minutes
        {
            $project: {
                _id: 0,
                searchToCartAssociations: {
                    $reduce: {
                        input: "$activities",
                        initialValue: [],
                        in: {
                            $concatArrays: [
                                "$$value",
                                {
                                    $cond: [
                                        {
                                            $and: [
                                                {
                                                    $eq: [
                                                        "$$this.activityType",
                                                        "cartAdd",
                                                    ],
                                                },
                                                {
                                                    $gte: [
                                                        "$$this.timestamp",
                                                        {
                                                            $arrayElemAt: [
                                                                {
                                                                    $filter: {
                                                                        input: "$activities",
                                                                        as: "prev",
                                                                        cond: {
                                                                            $and: [
                                                                                {
                                                                                    $eq: [
                                                                                        "$$prev.activityType",
                                                                                        "search",
                                                                                    ],
                                                                                },
                                                                                {
                                                                                    $lte: [
                                                                                        "$$prev.timestamp",
                                                                                        "$$this.timestamp",
                                                                                    ],
                                                                                },
                                                                                {
                                                                                    $gte: [
                                                                                        "$$this.timestamp",
                                                                                        {
                                                                                            $add: [
                                                                                                "$$prev.timestamp",
                                                                                                10 *
                                                                                                    60 *
                                                                                                    1000,
                                                                                            ],
                                                                                        },
                                                                                    ],
                                                                                },
                                                                            ],
                                                                        },
                                                                    },
                                                                },
                                                                -1, // Get the latest search before this cartAdd
                                                            ],
                                                        },
                                                    ],
                                                },
                                            ],
                                        },
                                        {
                                            searchTerm: {
                                                $arrayElemAt: [
                                                    {
                                                        $filter: {
                                                            input: "$activities",
                                                            as: "prev",
                                                            cond: {
                                                                $and: [
                                                                    {
                                                                        $eq: [
                                                                            "$$prev.activityType",
                                                                            "search",
                                                                        ],
                                                                    },
                                                                    {
                                                                        $lte: [
                                                                            "$$prev.timestamp",
                                                                            "$$this.timestamp",
                                                                        ],
                                                                    },
                                                                    {
                                                                        $gte: [
                                                                            "$$this.timestamp",
                                                                            {
                                                                                $add: [
                                                                                    "$$prev.timestamp",
                                                                                    10 *
                                                                                        60 *
                                                                                        1000,
                                                                                ],
                                                                            },
                                                                        ],
                                                                    },
                                                                ],
                                                            },
                                                        },
                                                    },
                                                    -1, // Take the last matching "search"
                                                ],
                                            },
                                            cartProduct: "$$this.productNo",
                                        },
                                        null,
                                    ],
                                },
                            ],
                        },
                    },
                },
            },
        },
        // Flatten search-to-cart associations
        {
            $unwind: { path: "$searchToCartAssociations" },
        },
        // Group by search term and product to count occurrences
        {
            $group: {
                _id: {
                    searchTerm: "$searchToCartAssociations.searchTerm",
                    cartProduct: "$searchToCartAssociations.cartProduct",
                },
                count: { $sum: 1 },
            },
        },
        {
            $sort: {
                "_id.searchTerm": 1,
                count: -1,
            },
        },
    ];
    const results = await Activity.aggregate(pipeline).exec();
    console.log(results);
};
