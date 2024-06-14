import { sequelize } from "../models/mysql/index";

const connectToMySQLDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log("Connection to MySQL established");
        await sequelize.sync({ alter: true });
    } catch (error) {
        console.error("Unable to connect to MySQL database:", error);
    }
};

export default connectToMySQLDatabase;
