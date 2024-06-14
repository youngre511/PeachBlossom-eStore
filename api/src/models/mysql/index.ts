import { Sequelize } from "sequelize-typescript";
import config from "../../config/config";
import { sqlCategory } from "./sqlCategoryModel";
import { sqlSubCategory } from "./sqlSubCategoryModel";
import { sqlProduct } from "./sqlProductModel";
import { sqlCart } from "./sqlCartModel";
import { sqlCartItem } from "./sqlCartItemModel";
import { sqlInventory } from "./sqlInventoryModel";
import { sqlOrder } from "./sqlOrderModel";
import { sqlOrderItem } from "./sqlOrderItemModel";
import { sqlProductPromotion } from "./sqlProductPromotionModel";
import { sqlPromotion } from "./sqlPromotionModel";
import { sqlCustomer } from "./sqlCustomerModel";

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize({
    database: dbConfig.database,
    dialect: dbConfig.dialect,
    username: dbConfig.username,
    password: dbConfig.password,
    host: dbConfig.host,
    models: [
        sqlCartItem,
        sqlCart,
        sqlCategory,
        sqlCustomer,
        sqlInventory,
        sqlOrder,
        sqlOrderItem,
        sqlProduct,
        sqlProductPromotion,
        sqlPromotion,
        sqlSubCategory,
    ],
    logging: false,
});

export { sequelize };
export default sequelize;
