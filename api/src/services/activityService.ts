import type { PipelineStage } from "mongoose";
import Activity from "../models/mongo/activityModel.js";
import { generateActivityId } from "../utils/generateActivityId.js";

export const assignVisitorId = async (userId?: number) => {
    try {
        let id;
        if (userId) {
            const record = await Activity.findOne({ userId: userId });
            if (record) {
                id = record.visitorActivityId;
            }
        }
        if (!id) {
            id = await generateActivityId();
        }

        return id;
    } catch (error) {
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error("Error assigning VisitorId: " + error.message);
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error(
                "An unknown error occurred while assigning a visitorId"
            );
        }
    }
};

// export const logActivity = async (activity:)

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
                _id: "$visitorActivityId",
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
