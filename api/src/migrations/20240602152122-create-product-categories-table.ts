import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("ProductCategories", {
            categoryName: {
                type: DataTypes.STRING,
                allowNull: false,
                references: {
                    model: "Categories",
                    key: "categoryName",
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
            "ProductCategories",
            ["categoryName", "productNo"],
            {
                name: "idx_category_product",
                unique: true,
            }
        );
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex(
            "ProductCategories",
            "idx_category_product"
        );
        await queryInterface.dropTable("Carts");
    },
};
