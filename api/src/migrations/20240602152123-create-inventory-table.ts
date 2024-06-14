import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("Inventory", {
            inventory_id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            productNo: {
                type: DataTypes.STRING(20),
                unique: true,
                references: {
                    model: "Products",
                    key: "productNo",
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

        await queryInterface.addIndex("Inventory", ["productNo"], {
            name: "idx_productNo",
            unique: true,
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex("Inventory", "idx_productNo");
        await queryInterface.dropTable("Inventory");
    },
};
