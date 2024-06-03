import { v4 as uuidv4 } from "uuid";
const { sqlProduct } = require("../models/mysql/sqlProductModel");

const generateProductNo = async (prefix: string): Promise<string> => {
    let productNo: string;
    let isUnique = false;

    do {
        productNo = `${prefix}-${uuidv4().split("-").join("").substring(0, 8)}`;
        const existingProduct = await sqlProduct.findOne({
            where: { productNo: productNo },
        });
        if (!existingProduct) {
            isUnique = true;
        }
    } while (!isUnique);

    return productNo;
};

export default generateProductNo;
