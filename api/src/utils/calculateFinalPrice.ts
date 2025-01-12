import { Op } from "sequelize";
import { sqlProduct } from "../models/mysql/sqlProductModel.js";
import { sqlPromotion } from "../models/mysql/sqlPromotionModel.js";
import { RawJoinReqProduct } from "../services/serviceTypes.js";

export const calculateFinalPrice = async (product: RawJoinReqProduct) => {
    const currentDate = new Date();

    const promotions = await sqlPromotion.findAll({
        include: [
            {
                model: sqlProduct,
                as: "products",
                where: { productNo: product.productNo },
                through: {
                    attributes: [],
                },
            },
        ],
        where: {
            active: true,
            startDate: { [Op.lte]: currentDate },
            endDate: { [Op.gte]: currentDate },
        },
    });

    const promotionId =
        promotions.length > 0 ? promotions[0].promotionId : undefined;

    let finalPrice: number;

    // If there is an active promotion, calculate final price. Otherwise, set final price equal to regular price
    if (promotionId) {
        const promo = promotions[0];
        if (promo.discountType === "percentage") {
            finalPrice = product.price - promo.discountValue * product.price;
        } else {
            finalPrice = product.price - promo.discountValue;
        }
    } else {
        finalPrice = product.price;
    }

    return { finalPrice, promotionId };
};
