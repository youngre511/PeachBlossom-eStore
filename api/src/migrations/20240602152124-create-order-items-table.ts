import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("OrderItems", {
            order_item_id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            order_id: {
                type: DataTypes.BIGINT,
                references: {
                    model: "Orders",
                    key: "order_id",
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
                onDelete: "SET NULL",
            },
            quantity: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 1,
            },
            priceWhenOrdered: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            fulfillmentStatus: {
                type: DataTypes.ENUM(
                    "unfulfilled",
                    "partially fulfilled",
                    "fulfilled",
                    "back ordered",
                    "on hold",
                    "cancelled",
                    "exception"
                ),
                allowNull: false,
            },
        });

        await queryInterface.addIndex("OrderItems", ["fulfillmentStatus"], {
            name: "idx_fulfillmentStatus",
        });

        await queryInterface.addIndex("OrderItems", ["order_id"], {
            name: "idx_order_id",
            unique: false,
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex("OrderItems", "idx_fulfillmentStatus");
        await queryInterface.removeIndex("OrderItems", "idx_order_id");
        await queryInterface.dropTable("OrderItems");
    },
};
