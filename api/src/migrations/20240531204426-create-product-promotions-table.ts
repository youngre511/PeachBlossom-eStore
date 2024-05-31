import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("ProductPromotions", {
            product_number: {
                type: DataTypes.STRING(20),
                allowNull: false,
                references: {
                    model: "Products",
                    key: "product_number",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            promotionId: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: "Promotions",
                    key: "promotionId",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
        });
    },
    down: async (queryInterface: QueryInterface) => {
        await queryInterface.dropTable("Categories");
    },
};
