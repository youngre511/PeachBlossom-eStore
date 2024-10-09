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
import { Model, Op, Order } from "sequelize";
import { sqlCartItem } from "../models/mysql/sqlCartItemModel.js";
import { sqlCart } from "../models/mysql/sqlCartModel.js";
import { sqlAddress } from "../models/mysql/sqlAddressModel.js";
import { JoinReqProduct, RawJoinReqProduct } from "./serviceTypes.js";
import { sqlInventory } from "../models/mysql/sqlInventoryModel.js";

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
    try {
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
        console.log("Order Parsed.");
        return parsedOrder;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Error extracting order data: ${error.message}`);
        } else {
            throw new Error(
                `An unknown error ocurred while extracting order data`
            );
        }
    }
};

export const placeOrder = async (orderData: OrderData) => {
    const sqlTransaction = await sequelize.transaction();

    try {
        const shipping = orderData.shipping;
        const orderDetails = orderData.orderDetails;
        const orderNo: string = await generateOrderNo();

        const shippingAddressFull = `${shipping.shippingAddress} | ${shipping.shippingAddress2}`;

        console.log("Attempting to find or create address table record");
        // Find address if it already exists and create it if it doesn't.
        const [address, created] = await sqlAddress.findOrCreate({
            where: {
                shippingAddress: shippingAddressFull,
                city: shipping.city,
                stateAbbr: shipping.state,
                zipCode: shipping.zipCode,
                phoneNumber: shipping.phoneNumber,
            },
            transaction: sqlTransaction,
        });
        if (!address) {
            throw new Error("Address record creation/retrieval failed.");
        }
        console.log(
            `Successfully found or created address ${address.address_id}`
        );
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

        console.log("Creating order");
        const createdOrder = await sqlOrder.create(newOrder, {
            transaction: sqlTransaction,
        });

        if (!createdOrder) {
            throw new Error(
                "Error creating order. Unable to fetch created order"
            );
        }

        console.log("Successfully created order. Now creating order items.");

        await Promise.all(
            orderDetails.items.map(async (item) => {
                try {
                    console.log(
                        `Looking up product ${item.productNo} inventory record`
                    );
                    const inventoryRecord = (await sqlProduct.findOne({
                        where: { productNo: item.productNo },
                        include: [
                            {
                                model: sqlInventory,
                                as: "Inventory",
                            },
                        ],
                        lock: true,
                        transaction: sqlTransaction,
                        raw: true,
                    })) as unknown as RawJoinReqProduct;
                    if (!inventoryRecord) {
                        throw new Error("Inventory record not found.");
                    }
                    const inStock =
                        inventoryRecord["Inventory.stock"] -
                            inventoryRecord["Inventory.reserved"] >=
                        item.quantity;
                    const orderItem = {
                        order_id: createdOrder.dataValues.order_id,
                        productNo: item.productNo,
                        quantity: item.quantity,
                        priceWhenOrdered: item.priceAtCheckout,
                        fulfillmentStatus: inStock
                            ? "unfulfilled"
                            : "back ordered",
                    };
                    console.log(
                        `Creating order item with fulfillment status ${
                            inStock ? "unfulfilled" : "back ordered"
                        }`
                    );
                    await sqlOrderItem.create(orderItem, {
                        transaction: sqlTransaction,
                    });
                } catch (error) {
                    throw new Error(
                        `Error creating order item for product ${
                            item.productNo
                        }: ${error instanceof Error ? error.message : error}`
                    );
                }
            })
        );

        console.log("Deleting cart and cart items.");
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

        await sqlTransaction.commit();

        return {
            success: true,
            message: "Order successfully placed",
            orderNo: orderNo,
        };
    } catch (error) {
        await sqlTransaction.rollback();
        throw error;
    }
};

export const getOrders = async (filters: GetOrdersFilters) => {
    try {
        if (!filters.sort) {
            filters.sort = "orderDate-descend";
        }

        const page = +filters.page || 1;
        const offset = (page - 1) * +filters.itemsPerPage;

        console.log("Constructing order query from filters:", filters);
        const whereClause: any = {};
        const addressWhereClause: any = {};
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
            andConditions.push({
                orderStatus: { [Op.in]: filters.orderStatus },
            });
        }

        if (filters.state) {
            if (Array.isArray(filters.state)) {
                addressWhereClause.stateAbbr = { [Op.in]: filters.state };
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

        console.log("WHERE:", whereClause);
        console.log("ORDER:", orderArray);
        console.log("ADDRESS WHERE:", addressWhereClause);

        console.log("Finding and counting results");
        const ordersData = (await sqlOrder.findAndCountAll({
            where: whereClause,
            order: orderArray,
            limit: +filters.itemsPerPage,
            offset: offset,
            include: [
                {
                    model: sqlAddress,
                    as: "Address",
                    where: addressWhereClause,
                },
            ],
            subQuery: false,
            nest: true,
        })) as unknown as JoinReqFilteredOrders;

        const totalCount = ordersData.count;
        console.log(`${totalCount} matching results`);

        if (totalCount > 0 && !ordersData) {
            throw new Error("An unknown error occurred when retrieving orders");
        }

        let orders = [];
        if (totalCount > 0 && ordersData) {
            console.log("Extracting order data.");
            orders = ordersData.rows.map((orderData) =>
                extractOrderData(orderData)
            );
        }

        return { totalCount, orders };
    } catch (error) {
        throw error;
    }
};

export const getOneOrder = async (
    orderNo: string,
    email: string | undefined
) => {
    try {
        console.log(`Fetching order ${orderNo}`);
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
            nest: true,
        })) as unknown as JoinReqOrderDetails;

        if (!orderData) {
            throw new Error("Order not found.");
        }

        console.log("Extracting order data");
        const parsedOrderData = extractOrderData(orderData);

        console.log("Will verify email:", email ? true : false);
        // Check to see that email address matches record if supplied by front end.
        if (
            email &&
            parsedOrderData.email.toLowerCase() !== email.toLowerCase()
        ) {
            throw new Error(
                `Order ${orderNo} is not associated with ${email}.`
            );
        }
        return parsedOrderData;
    } catch (error) {
        throw error;
    }
};

export const updateOrder = async (updateInfo: UpdateOrder) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const items: UpdateItem[] = updateInfo.items;
        console.log("Updating order:", updateInfo);

        // Find address if it already exists and create it if it doesn't.
        const [address, created] = await sqlAddress.findOrCreate({
            where: {
                shippingAddress: updateInfo.shippingAddress,
                city: updateInfo.city,
                stateAbbr: updateInfo.stateAbbr,
                zipCode: updateInfo.zipCode,
                phoneNumber: updateInfo.phoneNumber,
            },
            transaction: sqlTransaction,
        });

        if (!address) {
            throw new Error("Unable to find or create address record.");
        }

        console.log("Updating order details");
        await sqlOrder.update(
            {
                subTotal: updateInfo.subTotal,
                shipping: updateInfo.shipping,
                tax: updateInfo.tax,
                totalAmount: updateInfo.totalAmount,
                address_id: address.dataValues.address_id,
                email: updateInfo.email,
                orderStatus: updateInfo.orderStatus,
            },
            {
                where: { orderNo: updateInfo.orderNo },
                transaction: sqlTransaction,
            }
        );

        console.log("Updating order items");
        await Promise.all(
            items.map(async (item) => {
                try {
                    const itemRecord = await sqlOrderItem.findByPk(
                        item.order_item_id,
                        {
                            lock: sqlTransaction.LOCK.UPDATE,
                            transaction: sqlTransaction,
                        }
                    );
                    if (!itemRecord) {
                        throw new Error(
                            `Order item ${item.order_item_id} not found in database`
                        );
                    }
                    const oldStatus = itemRecord.fulfillmentStatus;
                    const soldConditions = ["shipped", "delivered"];

                    // Remove quantity from inventory reserved numbers if newly shipped/delivered, and add back if regressing from shipped/delivered to another status.
                    if (
                        !soldConditions.includes(oldStatus) &&
                        soldConditions.includes(item.fulfillmentStatus)
                    ) {
                        console.log(
                            "Removing quantity from inventory reserved stock"
                        );
                        await sqlInventory.decrement(
                            { reserved: item.quantity },
                            {
                                where: {
                                    product_id: sequelize.literal(
                                        `(SELECT id FROM Products WHERE productNo= '${itemRecord.productNo}')`
                                    ),
                                },
                                transaction: sqlTransaction,
                            }
                        );
                    } else if (
                        soldConditions.includes(oldStatus) &&
                        !soldConditions.includes(item.fulfillmentStatus)
                    ) {
                        console.log(
                            "Returning quantity to inventory as reserved stock to await shipping."
                        );
                        await sqlInventory.increment(
                            { reserved: item.quantity },
                            {
                                where: {
                                    product_id: sequelize.literal(
                                        `(SELECT id FROM Products WHERE productNo= '${itemRecord.productNo}')`
                                    ),
                                },
                                transaction: sqlTransaction,
                            }
                        );
                    }

                    console.log(
                        `Saving order item ${itemRecord.order_item_id}`
                    );
                    itemRecord.quantity = item.quantity;
                    itemRecord.fulfillmentStatus = item.fulfillmentStatus;
                    await itemRecord.save({ transaction: sqlTransaction });
                } catch (error) {
                    throw new Error(
                        `Error updating item ${item.order_item_id}: ${
                            error instanceof Error ? error.message : error
                        }`
                    );
                }
            })
        );
        await sqlTransaction.commit();
    } catch (error) {
        await sqlTransaction.rollback();
        throw error;
    }
};
