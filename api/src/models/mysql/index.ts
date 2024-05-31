import { Sequelize } from "sequelize-typescript";
import config from "../../config/config";
import { sqlCategory } from "./sqlCategoryModel";
import { sqlProduct } from "./sqlProductModel";

const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

const sequelize = new Sequelize({
    database: dbConfig.database,
    dialect: dbConfig.dialect,
    username: dbConfig.username,
    password: dbConfig.password,
    host: dbConfig.host,
    models: [sqlCategory, sqlProduct],
    logging: false,
});

export { sequelize };
export default sequelize;
