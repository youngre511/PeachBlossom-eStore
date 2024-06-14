import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("Customers", {
            customer_id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
        });
    },
    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable("Customers");
    },
};
