import { Sequelize } from "sequelize-typescript";
import config from "../../config/config.js";
import { sqlCategory } from "./sqlCategoryModel.js";
import { sqlSubcategory } from "./sqlSubcategoryModel.js";
import { sqlProduct } from "./sqlProductModel.js";
import { sqlCart } from "./sqlCartModel.js";
import { sqlCartItem } from "./sqlCartItemModel.js";
import { sqlInventory } from "./sqlInventoryModel.js";
import { sqlOrder } from "./sqlOrderModel.js";
import { sqlOrderItem } from "./sqlOrderItemModel.js";
import { sqlProductPromotion } from "./sqlProductPromotionModel.js";
import { sqlPromotion } from "./sqlPromotionModel.js";
import { sqlCustomer } from "./sqlCustomerModel.js";
import { sqlUser } from "./sqlUserModel.js";
import { sqlAddress } from "./sqlAddressModel.js";
import { sqlAdmin } from "./sqlAdminModel.js";
import { sqlCustomerAddress } from "./sqlCustomerAddressModel.js";
import { sqlRefreshToken } from "./sqlRefreshTokenModel.js";

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
        sqlSubcategory,
        sqlUser,
        sqlAddress,
        sqlAdmin,
        sqlCustomerAddress,
        sqlRefreshToken,
    ],
    logging: console.log,
    pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
    },
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
