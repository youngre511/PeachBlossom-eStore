import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("Promotions", {
            promo_data_id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            promotionId: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
            },
            promotionCode: {
                type: DataTypes.STRING,
                allowNull: true,
            },
            promotionName: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            promotionDescription: {
                type: DataTypes.TEXT,
                allowNull: true,
            },
            discountType: {
                type: DataTypes.ENUM("percentage", "fixed"),
                allowNull: false,
            },
            discountValue: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            startDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            endDate: {
                type: DataTypes.DATE,
                allowNull: false,
            },
            active: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: true,
            },
        });

        await queryInterface.addIndex("Promotions", ["promotionId"], {
            name: "idx_promotionId",
            unique: true,
        });

        await queryInterface.addIndex("Promotions", ["promotionCode"], {
            name: "idx_promotionCode",
            unique: false,
        });
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex("Promotions", "idx_promotionId");
        await queryInterface.removeIndex("Promotions", "idx_promotionCode");
        await queryInterface.dropTable("Promotions");
    },
};
