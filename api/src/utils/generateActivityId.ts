import { v4 as uuidv4 } from "uuid";
import Activity from "../models/mongo/activityModel.js";

export const generateActivityId = async (): Promise<string> => {
    try {
        while (true) {
            const activityId = uuidv4();
            try {
                // Attempt to validate ID uniqueness against the database
                const existingId = await Activity.findOne({
                    visitorActivityId: activityId,
                });
                if (!existingId) {
                    return activityId; // Unique ID found
                }
            } catch (dbError) {
                console.warn(
                    "Database validation failed. Proceeding with unverified ID.",
                    dbError
                );
                // Return the generated ID directly if validation fails
                return activityId;
            }
        }
    } catch (error) {
        console.error("Critical failure in activity ID generation:", error);
        // Assign a fallback ID as a last resort
        return uuidv4();
    }
};
