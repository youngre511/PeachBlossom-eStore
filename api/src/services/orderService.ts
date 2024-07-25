import {
    GetOrdersFilters,
    OrderData,
    UpdateItem,
    UpdateOrder,
} from "../controllers/orderController.js";
import sequelize from "../models/mysql/index.js";
import { sqlOrder } from "../models/mysql/sqlOrderModel.js";
import { sqlOrderItem } from "../models/mysql/sqlOrderItemModel.js";
import { generateOrderNo } from "../utils/generateOrderNo.js";
import { sqlProduct } from "../models/mysql/sqlProductModel.js";
import { Model, Op, Order, fn, col, literal } from "sequelize";
import { JoinReqProduct } from "./cartService.js";
import { sqlCartItem } from "../models/mysql/sqlCartItemModel.js";
import { sqlCart } from "../models/mysql/sqlCartModel.js";
import { sqlAddress } from "../models/mysql/sqlAddressModel.js";

interface JoinReqOrderItem extends Model {
    order_item_id: number;
    order_id: number;
    productNo: string;
    Product: Partial<JoinReqProduct>;
    quantity: number;
    priceWhenOrdered: number;
    fulfillmentStatus: string;
}

interface AddressDetails {
    address_id: number;
    shippingAddress: string;
    city: string;
    stateAbbr: string;
    zipCode: string;
    phoneNumber: string;
}

interface OrderDetails {
    order_id: number;
    customerId: number | null;
    orderNo: string;
    orderDate: Date;
    subTotal: number;
    shipping: number;
    tax: number;
    totalAmount: number;
    address_id: number;
    Address: AddressDetails;
    email: string;
    orderStatus: string;
    OrderItem: JoinReqOrderItem[];
}

interface JoinReqOrderDetails extends OrderDetails, Model {}

interface JoinReqOrderSummary extends Partial<OrderDetails>, Model {}

interface JoinReqFilteredOrders extends Model {
    count: number;
    rows: JoinReqOrderSummary[];
}
const extractOrderData = (
    orderData: JoinReqOrderDetails | JoinReqOrderSummary
) => {
    const parsedOrder = orderData.get();
    if (parsedOrder.OrderItem) {
        const parsedOrderItems = parsedOrder.OrderItem.map(
            (item: JoinReqOrderItem) => {
                const parsedItem = item.get();
                if (parsedItem.Product) {
                    parsedItem.Product = parsedItem.Product.get();
                }

                return parsedItem;
            }
        );
        parsedOrder.OrderItem = parsedOrderItems;
    }
    if (parsedOrder.Address) {
        const address = parsedOrder.Address.get();
        parsedOrder.shippingAddress = address.shippingAddress;
        parsedOrder.city = address.city;
        parsedOrder.stateAbbr = address.stateAbbr;
        parsedOrder.zipCode = address.zipCode;
        parsedOrder.phoneNumber = address.phoneNumber;
    }
    return parsedOrder;
};

export const placeOrder = async (orderData: OrderData) => {
    const sqlTransaction = await sequelize.transaction();

    try {
        const shipping = orderData.shipping;
        const orderDetails = orderData.orderDetails;
        const orderNo: string = await generateOrderNo();

        const shippingAddressFull = `${shipping.shippingAddress} | ${shipping.shippingAddress2}`;

        // Check to see if address already exists in the address table
        let address = await sqlAddress.findOne({
            where: {
                shippingAddress: shippingAddressFull,
                city: shipping.city,
                stateAbbr: shipping.state,
                zipCode: shipping.zipCode,
                phoneNumber: shipping.phoneNumber,
            },
            transaction: sqlTransaction,
        });

        // If not, create a new entry in the address table with the provided shipping address and return the data in order to use the newly created address_id when creating the order record.
        if (!address) {
            address = await sqlAddress.create(
                {
                    shippingAddress: shippingAddressFull,
                    city: shipping.city,
                    stateAbbr: shipping.state,
                    zipCode: shipping.zipCode,
                    phoneNumber: shipping.phoneNumber,
                },
                { transaction: sqlTransaction }
            );
        }

        const newOrder = {
            customerId: orderData.customerId,
            orderNo: orderNo,
            email: orderData.email,
            address_id: address.address_id,
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
                order_id: createdOrder.dataValues.order_id,
                productNo: item.productNo,
                quantity: item.quantity,
                priceWhenOrdered: item.priceAtCheckout,
                fulfillmentStatus: "unfulfilled",
            };
            await sqlOrderItem.create(orderItem, {
                transaction: sqlTransaction,
            });
        }

        if (orderData.cartId) {
            await sqlCartItem.destroy({
                where: { cart_id: orderData.cartId },
                transaction: sqlTransaction,
            });
            await sqlCart.destroy({
                where: { cart_id: orderData.cartId },
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

export const getOrders = async (filters: GetOrdersFilters) => {
    if (!filters.sort) {
        filters.sort = "orderDate-descend";
    }

    const page = +filters.page || 1;
    const offset = (page - 1) * +filters.itemsPerPage;

    const whereClause: any = {};
    if (filters.search) {
        whereClause[Op.or] = [
            { customer_id: { [Op.like]: `%${filters.search}%` } },
            { email: { [Op.like]: `%${filters.search}%` } },
            { orderNo: { [Op.like]: `%${filters.search}%` } },
        ];
    }

    const andConditions = [];

    if (filters.orderStatus) {
        console.log("orderStatus", filters.orderStatus);
        andConditions.push({ orderStatus: { [Op.in]: filters.orderStatus } });
    }

    if (filters.state) {
        if (Array.isArray(filters.state)) {
            andConditions.push({ stateAbbr: { [Op.in]: filters.state } });
        }
    }

    if (filters.startDate || filters.endDate) {
        const dateConditions: { [key: symbol]: Date } = {};
        if (filters.startDate) {
            dateConditions[Op.gte] = new Date(filters.startDate);
        }
        if (filters.endDate) {
            dateConditions[Op.lte] = new Date(filters.endDate);
        }
        andConditions.push({ orderDate: dateConditions });
    }

    if (andConditions.length) {
        whereClause[Op.and] = andConditions;
    }

    const validSortMethods = [
        "orderDate-ascend",
        "orderDate-descend",
        "totalAmount-ascend",
        "totalAmount-descend",
        "stateAbbr-ascend",
        "stateAbbr-descend",
        "orderNo-ascend",
        "orderNo-descend",
    ];

    let sortBy: string;
    let sortOrder: string;

    if (validSortMethods.includes(filters.sort)) {
        const splitSort = filters.sort.split("-");
        sortOrder = splitSort[1].split("en")[0].toUpperCase();
        sortBy = splitSort[0];
    } else {
        (sortOrder = "DESC"), (sortBy = "orderDate");
    }

    const orderArray: Order = [[sortBy, sortOrder]];
    if (sortBy !== "orderDate") {
        orderArray.push(["orderDate", "DESC"]);
    }

    const ordersData = (await sqlOrder.findAndCountAll({
        where: whereClause,
        order: orderArray,
        limit: +filters.itemsPerPage,
        offset: offset,
        include: [
            {
                model: sqlAddress,
                as: "Address",
            },
        ],
        subQuery: false,
        nest: true,
    })) as unknown as JoinReqFilteredOrders;

    const totalCount = ordersData.count;

    if (totalCount > 0 && !ordersData) {
        throw new Error("An unknown error occurred when retrieving orders");
    }

    let orders = [];
    if (totalCount > 0 && ordersData) {
        orders = ordersData.rows.map((orderData) =>
            extractOrderData(orderData)
        );
    }

    return { totalCount, orders };
};

export const getOneOrder = async (
    orderNo: string,
    email: string | undefined
) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const orderData = (await sqlOrder.findOne({
            where: { orderNo: orderNo },
            include: [
                {
                    model: sqlOrderItem,
                    as: "OrderItem",
                    include: [
                        {
                            model: sqlProduct,
                            as: "Product",
                        },
                    ],
                },
                {
                    model: sqlAddress,
                    as: "Address",
                },
            ],
            transaction: sqlTransaction,
            nest: true,
        })) as unknown as JoinReqOrderDetails;

        if (!orderData) {
            throw new Error("Order not found.");
        }
        const parsedOrderData = extractOrderData(orderData);

        if (email && parsedOrderData.email !== email) {
            throw new Error(
                `Order ${orderNo} is not associated with ${email}.`
            );
        }
        return parsedOrderData;
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error placing order: " + error.message);
        } else {
            throw new Error("An unknown error occurred while placing order");
        }
    }
};

export const updateOrder = async (updateInfo: UpdateOrder) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const items: UpdateItem[] = updateInfo.items;

        let address = await sqlAddress.findOne({
            where: {
                shippingAddress: updateInfo.shipping,
                city: updateInfo.city,
                stateAbbr: updateInfo.stateAbbr,
                zipCode: updateInfo.zipCode,
                phoneNumber: updateInfo.phoneNumber,
            },
            transaction: sqlTransaction,
        });

        // If the address doesn't exist, create a new one
        if (!address) {
            address = await sqlAddress.create(
                {
                    shippingAddress: updateInfo.shipping,
                    city: updateInfo.city,
                    stateAbbr: updateInfo.stateAbbr,
                    zipCode: updateInfo.zipCode,
                    phoneNumber: updateInfo.phoneNumber,
                },
                { transaction: sqlTransaction }
            );
        }

        await sqlOrder.update(
            {
                subTotal: updateInfo.subTotal,
                shipping: updateInfo.shipping,
                tax: updateInfo.tax,
                totalAmount: updateInfo.totalAmount,
                address_id: address.address_id,
                email: updateInfo.email,
                orderStatus: updateInfo.orderStatus,
            },
            {
                where: { orderNo: updateInfo.orderNo },
                transaction: sqlTransaction,
            }
        );
        await Promise.all(
            items.map(async (item) => {
                await sqlOrderItem.update(
                    {
                        quantity: item.quantity,
                        fulfillmentStatus: item.fulfillmentStatus,
                    },
                    {
                        where: { order_item_id: item.order_item_id },
                        transaction: sqlTransaction,
                    }
                );
            })
        );
        await sqlTransaction.commit();
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error placing order: " + error.message);
        } else {
            throw new Error("An unknown error occurred while placing order");
        }
    }
};
