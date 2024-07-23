import { Dialect } from "sequelize";

interface DatabaseConfig {
    [key: string]: {
        username: string;
        password: string | undefined;
        database: string;
        host: string;
        dialect: Dialect;
        dialectOptions: {
            connectTimeout: number;
        };
    };
}

const config: DatabaseConfig = {
    development: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || undefined,
        database: process.env.DB_NAME_TEST || "peach_blossom_estore",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: "mysql",
        dialectOptions: {
            connectTimeout: 10000, // 10 seconds
        },
    },
    test: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || undefined,
        database: process.env.DB_NAME_TEST || "peach_blossom_estore_test",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: "mysql",
        dialectOptions: {
            connectTimeout: 10000, // 10 seconds
        },
    },
    production: {
        username: process.env.DB_USERNAME || "root",
        password: process.env.DB_PASSWORD || undefined,
        database: process.env.DB_NAME_TEST || "peach_blossom_estore_prod",
        host: process.env.DB_HOST || "127.0.0.1",
        dialect: "mysql",
        dialectOptions: {
            connectTimeout: 10000, // 10 seconds
        },
    },
};

export default config;
