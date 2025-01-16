import { customAlphabet } from "nanoid";
import { sqlOrder } from "../models/mysql/sqlOrderModel.js";
const nanoid = customAlphabet("1234567890ABCDEF", 8);

export const generateOrderNo = async (): Promise<string> => {
    try {
        while (true) {
            const orderNo = nanoid();

            try {
                const existingOrder = await sqlOrder.findOne({
                    where: { orderNo },
                });
                if (!existingOrder) {
                    return orderNo; // Unique order number found
                }
            } catch (dbError) {
                throw new Error(
                    `Database validation failed. Proceeding with unverified orderNo: ${dbError}`
                );
            }
        }
    } catch (error) {
        console.error("Error generating orderNo:", error);
        throw new Error("Critical failure generating orderNo");
    }
};
