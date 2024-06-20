import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("Inventory", {
            inventory_id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            product_id: {
                type: DataTypes.BIGINT,
                unique: true,
                references: {
                    model: "Products",
                    key: "product_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
            stock: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            reserved: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },
            createdAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            updatedAt: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
        });

        await queryInterface.addIndex("Inventory", ["product_id"], {
            name: "idx_product_id",
            unique: true,
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex("Inventory", "idx_product_id");
        await queryInterface.dropTable("Inventory");
    },
};
