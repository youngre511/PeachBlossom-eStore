import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("CartItems", {
            cart_item_id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            cart_id: {
                type: DataTypes.BIGINT,
                references: {
                    model: "Carts",
                    key: "cart_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            productNo: {
                type: DataTypes.STRING(20),
                references: {
                    model: "Products",
                    key: "productNo",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            thumbnailUrl: {
                type: DataTypes.STRING(50),
                allowNull: true,
            },
            promotionId: {
                type: DataTypes.STRING,
                allowNull: true,
                references: {
                    model: "Promotions",
                    key: "promotionId",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            finalPrice: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
        });

        await queryInterface.addIndex("CartItems", ["cart_id"]),
            {
                name: "idx_cart_id",
                unique: false,
            };
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex("CartItems", "idx_cart_id");
        await queryInterface.dropTable("CartItems");
    },
};
