const { customAlphabet } = require("nanoid");
const { sqlOrder } = require("../models/mysql/sqlOrderModel");

const generateOrderNo = async (): Promise<string> => {
    let orderNo;
    let isUnique = false;

    do {
        orderNo = customAlphabet("1234567890ABCDEF", 8);
        const existingOrder = await sqlOrder.findOne({
            where: { orderNo: orderNo },
        });
        if (!existingOrder) {
            isUnique = true;
        }
    } while (!isUnique);

    return orderNo;
};
