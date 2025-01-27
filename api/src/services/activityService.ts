import type { ClientSession, PipelineStage } from "mongoose";
import Activity, { IActivity } from "../models/mongo/activityModel.js";
import { generateTrackingId } from "../utils/generateTrackingId.js";
import { getCustomerIdFromUsername, getIdFromUsername } from "./userService.js";
import {
    ProductInteractionLog,
    SearchLog,
} from "../controllers/activityController.js";
import mongoose from "mongoose";
import sequelize from "../models/mysql/index.js";
import { sqlCustomer } from "../models/mysql/sqlCustomerModel.js";

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
            trackingId = await generateTrackingId();
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
                timestamp: new Date(record.timestamp),
            })
        );

        const result = await Activity.insertMany(newLogs, { session });

        console.log(`Successfully added ${result.length} new logs`);

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

export const associateUserId = async (
    username: string,
    trackingId: string,
    passedSession?: ClientSession
) => {
    const session: ClientSession = passedSession
        ? passedSession
        : await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = await getIdFromUsername(username);
        if (!userId) {
            console.error("Unable to retrieve userId from username");
            return;
        }
        const existingRecord = await Activity.findOne(
            { trackingId: trackingId },
            null,
            { session }
        );
        if (
            existingRecord &&
            existingRecord.userId &&
            existingRecord.userId !== userId
        ) {
            console.log(
                "TrackingId associated with another user. Assigning new trackingId."
            );
            const newTrackingId = await assignTrackingId(username);
            return newTrackingId;
        }

        await Activity.updateMany(
            { trackingId: trackingId },
            { $set: { userId: userId } },
            { session, upsert: false }
        );

        if (!passedSession) {
            await session.commitTransaction();
        }

        return;
    } catch (error) {
        if (!passedSession) {
            await session.abortTransaction();
        }

        if (error instanceof Error) {
            console.error(
                "Error associating userId with trackingId: " + error.message
            );
        } else {
            console.error(
                "An unknown error occurred while associating userId with trackingId"
            );
        }
    } finally {
        if (!passedSession) {
            await session.endSession();
        }
    }
};

export const setCookieConsent = async (username: string, consent: boolean) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const customerId = await getCustomerIdFromUsername(username);
        if (!customerId) {
            throw new Error("Username not recognized");
        }

        const result = await sqlCustomer.update(
            { allowTracking: consent, madeCookieDecision: true },
            { where: { customer_id: customerId }, transaction: sqlTransaction }
        );

        if (result[0] !== 1) {
            throw new Error("Unable to update sqlCustomer table");
        }

        await sqlTransaction.commit();
        return { success: true };
    } catch (error) {
        await sqlTransaction.rollback();
        throw error;
    }
};

export const retrieveCookieConsent = async (username: string) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const customerId = await getCustomerIdFromUsername(username);
        if (!customerId) {
            throw new Error("Username not recognized");
        }

        const customer = await sqlCustomer.findByPk(customerId);

        if (!customer) {
            throw new Error("Unable to retrieve customer record");
        }

        await sqlTransaction.commit();
        return {
            allowAll: customer.allowTracking,
            userChosen: customer.madeCookieDecision,
        };
    } catch (error) {
        await sqlTransaction.rollback();
        throw error;
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
