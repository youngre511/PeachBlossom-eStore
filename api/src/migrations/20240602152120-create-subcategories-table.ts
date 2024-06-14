import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("SubCategories", {
            subCategory_id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            subCategoryName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            category_id: {
                type: DataTypes.BIGINT,
                allowNull: false,
                references: {
                    model: "Categories",
                    key: "category_id",
                },
                onUpdate: "CASCADE",
                onDelete: "CASCADE",
            },
        });

        await queryInterface.addIndex("SubCategories", ["subCategoryName"], {
            name: "idx_subCategoryName",
            unique: true,
        });

        await queryInterface.addIndex("SubCategories", ["category_id"], {
            name: "idx_category_id",
            unique: false,
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex(
            "SubCategories",
            "idx_subCategoryName"
        );
        await queryInterface.removeIndex("SubCategories", "idx_category_id");
        await queryInterface.dropTable("Categories");
    },
};
