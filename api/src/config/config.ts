import { Dialect } from "sequelize/types";

interface DatabaseConfig {
    [key: string]: {
        username: string;
        password: string | undefined;
        database: string;
        host: string;
        dialect: Dialect;
    };
}

const config: DatabaseConfig = {
    development: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || undefined,
        database: process.env.DB_NAME_TEST || "peach_blossom_estore",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: "mysql",
    },
    test: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || undefined,
        database: process.env.DB_NAME_TEST || "peach_blossom_estore_test",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: "mysql",
    },
    production: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || undefined,
        database: process.env.DB_NAME_TEST || "peach_blossom_estore_prod",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: "mysql",
    },
};

module.exports = config;
export default config;
