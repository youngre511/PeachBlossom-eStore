import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("Categories", {
            category_id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            categoryName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
        });

        await queryInterface.addIndex("Categories", ["categoryName"], {
            name: "idx_categoryName",
            unique: false,
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex("Categories", "idx_categoryName");
        await queryInterface.dropTable("Categories");
    },
};
