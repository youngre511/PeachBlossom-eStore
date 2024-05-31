import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("Promotions", {
            promotionId: {
                type: DataTypes.STRING,
                primaryKey: true,
                allowNull: false,
            },
            promotion_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            promotion_description: {
                type: DataTypes.TEXT,
            },
            discount_type: {
                type: DataTypes.ENUM("percentage", "fixed"),
                allowNull: false,
            },
            discount_value: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            start_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            end_date: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        });
    },
    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable("Promotions");
    },
};
