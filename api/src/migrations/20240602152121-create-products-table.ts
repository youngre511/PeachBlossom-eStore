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
            subCategory_id: {
                type: DataTypes.BIGINT,
                allowNull: true,
                references: {
                    model: "SubCategories",
                    key: "subCategory_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
        });

        await queryInterface.addIndex("Products", ["productNo"], {
            name: "idx_productNo",
            unique: true,
        });

        await queryInterface.addIndex("Products", ["subCategory_id"], {
            name: "idx_subCategory_id",
            unique: false,
        });

        await queryInterface.addIndex("Products", ["subCategory_id"], {
            name: "idx_category_id",
            unique: false,
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex("Products", "idx_productNo");
        await queryInterface.removeIndex("Products", "idx_category_id");
        await queryInterface.removeIndex("Products", "idx_subCategory_id");
        await queryInterface.dropTable("Products");
    },
};
