import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("Products", {
            id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            productNo: {
                type: DataTypes.STRING(20),
                allowNull: false,
                unique: true,
            },
            productName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            price: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            description: {
                type: DataTypes.TEXT("tiny"),
                allowNull: true,
            },
        });

        await queryInterface.addIndex("Products", ["productNo"], {
            name: "idx_productNo",
            unique: true,
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex("Products", "idx_productNo");
        await queryInterface.dropTable("Products");
    },
};
