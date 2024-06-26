import { OrderData } from "../controllers/orderController.js";
import sequelize from "../models/mysql/index.js";
import { sqlOrder } from "../models/mysql/sqlOrderModel.js";
import { sqlOrderItem } from "../models/mysql/sqlOrderItemModel.js";
import { generateOrderNo } from "../utils/generateOrderNo.js";

export const placeOrder = async (orderData: OrderData) => {
    const sqlTransaction = await sequelize.transaction();

    try {
        const shipping = orderData.shipping;
        const orderDetails = orderData.orderDetails;
        const orderNo: string = await generateOrderNo();

        const newOrder = {
            customerId: orderData.customerId,
            orderNo: orderNo,
            email: orderData.email,
            shippingAddress: `${shipping.shippingAddress} | ${shipping.shippingAddress2}`,
            zipCode: shipping.zipCode,
            stateAbbr: shipping.state,
            phoneNumber: shipping.phoneNumber,
            subTotal: orderDetails.subTotal,
            shipping: orderDetails.shipping,
            tax: orderDetails.tax,
            totalAmount: orderDetails.totalAmount,
            orderStatus: "in process",
        };

        await sqlOrder.create(newOrder, { transaction: sqlTransaction });

        const createdOrder = await sqlOrder.findOne({
            where: { orderNo: orderNo },
            transaction: sqlTransaction,
        });

        if (!createdOrder) {
            throw new Error(
                "Error creating order. Unable to fetch created order"
            );
        }

        for (const item of orderDetails.items) {
            const orderItem = {
                order_id: createdOrder.order_id,
                productNo: item.productNo,
                quantity: item.quantity,
                priceWhenOrdered: item.priceAtCheckout,
                fulfillmentStatus: "unfulfilled",
            };
            await sqlOrderItem.create(orderItem, {
                transaction: sqlTransaction,
            });
        }

        sqlTransaction.commit();

        return {
            success: true,
            message: "Order successfully placed",
            orderNo: orderNo,
        };
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error("Error placing order: " + error.message);
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error("An unknown error occurred while placing order");
        }
    }
};
