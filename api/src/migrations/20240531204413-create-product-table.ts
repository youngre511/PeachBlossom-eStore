import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("Products", {
            product_number: {
                type: DataTypes.STRING(20),
                primaryKey: true,
                allowNull: false,
            },
            product_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            category_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                references: {
                    model: "Categories",
                    key: "category_id",
                },
            },
            description: {
                type: DataTypes.TEXT("tiny"),
            },
        });
    },
    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable("Products");
    },
};
