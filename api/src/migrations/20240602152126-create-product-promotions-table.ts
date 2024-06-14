import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("ProductPromotions", {
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
            productNo: {
                type: DataTypes.STRING(20),
                allowNull: false,
                references: {
                    model: "Products",
                    key: "productNo",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
        });

        await queryInterface.addIndex(
            "ProductPromotions",
            ["promotionId", "productNo"],
            {
                name: "idx_promotion_productNo",
                unique: true,
            }
        );
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex(
            "ProductPromotions",
            "idx_promotion_productNo"
        );
        await queryInterface.dropTable("Carts");
    },
};
