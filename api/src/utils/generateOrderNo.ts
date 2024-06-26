import { customAlphabet } from "nanoid";
import { sqlOrder } from "../models/mysql/sqlOrderModel.js";
const nanoid = customAlphabet("1234567890ABCDEF", 8);

export const generateOrderNo = async (): Promise<string> => {
    let orderNo: string;
    let isUnique = false;

    do {
        orderNo = nanoid();
        const existingOrder = await sqlOrder.findOne({
            where: { orderNo: orderNo },
        });
        if (!existingOrder) {
            isUnique = true;
        }
    } while (!isUnique);
    console.log("orderNo", orderNo);
    return orderNo;
};
