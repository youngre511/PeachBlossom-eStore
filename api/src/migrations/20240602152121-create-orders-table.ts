import { QueryInterface, DataTypes } from "sequelize";

export default {
    up: async (queryInterface: QueryInterface) => {
        await queryInterface.createTable("Orders", {
            order_id: {
                type: DataTypes.BIGINT,
                autoIncrement: true,
                primaryKey: true,
            },
            customer_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                references: {
                    model: "Customers",
                    key: "customer_id",
                },
                onUpdate: "CASCADE",
                onDelete: "SET NULL",
            },
            orderNo: {
                type: DataTypes.STRING(50),
                allowNull: false,
                unique: true,
            },
            orderDate: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: DataTypes.NOW,
            },
            subTotal: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            shipping: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            tax: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            totalAmount: {
                type: DataTypes.DECIMAL(10, 2),
                allowNull: false,
            },
            shippingAddress: {
                type: DataTypes.STRING(255),
                allowNull: false,
            },
            stateAbbrev: {
                type: DataTypes.CHAR(2),
                allowNull: false,
            },
            zipCode: {
                type: DataTypes.CHAR(10),
                allowNull: false,
            },
            phoneNumber: {
                type: DataTypes.STRING(15),
                allowNull: false,
            },
            email: {
                type: DataTypes.STRING(254),
                allowNull: false,
            },
            orderStatus: {
                type: DataTypes.ENUM(
                    "processing",
                    "cancelled",
                    "ready to ship",
                    "shipped",
                    "delivered",
                    "back ordered"
                ),
                allowNull: false,
            },
        });
        await queryInterface.addIndex("Orders", ["orderNo"], {
            name: "idx_orderNumber",
            unique: true,
        });

        await queryInterface.addIndex("Orders", ["customer_id", "orderDate"], {
            name: "idx_customer_orderDate",
        });

        await queryInterface.addIndex(
            "Orders",
            ["customer_id", "orderStatus"],
            {
                name: "idx_customer_orderStatus",
            }
        );
    },

    down: async (queryInterface: QueryInterface) => {
        await queryInterface.removeIndex("Orders", "idx_orderNumber");
        await queryInterface.removeIndex("Orders", "idx_customer_orderDate");
        await queryInterface.removeIndex("Orders", "idx_customer_orderStatus");
        await queryInterface.dropTable("Orders");
    },
};
