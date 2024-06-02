import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("Carts", {
            cart_id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            customer_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                references: {
                    model: "Customers",
                    key: "customer_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
        });

        await queryInterface.addIndex("Carts", ["customer_id"], {
            name: "idx_customer_id",
            unique: false,
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex("Carts", "idx_customer_id");
        await queryInterface.dropTable("Carts");
    },
};
