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
        username: "root",
        password: undefined,
        database: "peach_blossom_estore",
        host: "127.0.0.1",
        dialect: "mysql",
    },
    test: {
        username: "root",
        password: undefined,
        database: "peach_blossom_estore_test",
        host: "127.0.0.1",
        dialect: "mysql",
    },
    production: {
        username: "root",
        password: undefined,
        database: "peach_blossom_estore_prod",
        host: "127.0.0.1",
        dialect: "mysql",
    },
};

export default config;
