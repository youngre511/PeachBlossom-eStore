import { Sequelize } from "sequelize-typescript";
import config from "../../config/config.js";
import { sqlCategory } from "./sqlCategoryModel.js";
import { sqlSubCategory } from "./sqlSubCategoryModel.js";
import { sqlProduct } from "./sqlProductModel.js";
import { sqlCart } from "./sqlCartModel.js";
import { sqlCartItem } from "./sqlCartItemModel.js";
import { sqlInventory } from "./sqlInventoryModel.js";
import { sqlOrder } from "./sqlOrderModel.js";
import { sqlOrderItem } from "./sqlOrderItemModel.js";
import { sqlProductPromotion } from "./sqlProductPromotionModel.js";
import { sqlPromotion } from "./sqlPromotionModel.js";
import { sqlCustomer } from "./sqlCustomerModel.js";

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
    logging: console.log,
});

sequelize
    .sync()
    .then(() => {
        console.log("Database & tables updated!");
    })
    .catch((error) => {
        console.error("Unable to sync the database:", error);
    });

export { sequelize };
export default sequelize;
