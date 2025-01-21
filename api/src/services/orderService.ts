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
import { Includeable, Model, Op, Order } from "sequelize";
import { sqlCartItem } from "../models/mysql/sqlCartItemModel.js";
import { sqlCart } from "../models/mysql/sqlCartModel.js";
import { sqlAddress } from "../models/mysql/sqlAddressModel.js";
import { JoinReqProduct, RawJoinReqProduct } from "./serviceTypes.js";
import { sqlInventory } from "../models/mysql/sqlInventoryModel.js";
import { calculatePagination } from "../utils/sqlSearchHelpers.js";

interface JoinReqOrderItem extends Model {
    order_item_id: number;
    order_id: number;
    productNo: string;
    Product: Partial<JoinReqProduct>;
    quantity: number;
    priceWhenOrdered: number;
    fulfillmentStatus: string;
}

export interface AddressDetails {
    address_id: number;
    shippingAddress: string;
    firstName: string;
    lastName: string;
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
            parsedOrder.firstName = address.firstName;
            parsedOrder.lastName = address.lastName;
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

const formatOrderList = (orders: any) => {
    for (let order of orders) {
        let numberOfItems = 0;
        for (let item of order.OrderItem) {
            numberOfItems += item.quantity;
        }
        order.numberOfItems = numberOfItems;
        order.thumbnailUrl = order.OrderItem[0].Product.thumbnailUrl;
        delete order.OrderItem;
        delete order.Address;
        delete order.address_id;
    }
    return orders;
};

export const placeOrder = async (orderData: OrderData) => {
    const sqlTransaction = await sequelize.transaction();

    try {
        const shipping = orderData.shipping;
        const orderDetails = orderData.orderDetails;
        const orderNo: string = await generateOrderNo();
        let backOrdered: boolean = false;

        const shippingAddressFull = `${shipping.shippingAddress} | ${shipping.shippingAddress2}`;

        console.log("Attempting to find or create address table record");
        // Find address if it already exists and create it if it doesn't.
        const [address, created] = await sqlAddress.findOrCreate({
            where: {
                shippingAddress: shippingAddressFull,
                city: shipping.city,
                stateAbbr: shipping.stateAbbr,
                zipCode: shipping.zipCode,
                phoneNumber: shipping.phoneNumber,
                firstName: shipping.firstName,
                lastName: shipping.lastName,
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
            customer_id: orderData.customerId,
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
                    if (!inStock) {
                        backOrdered = true;
                    }
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

        if (backOrdered) {
            console.log("Adjusting order status to 'back ordered'");
            createdOrder.orderStatus = "back ordered";
            await createdOrder.save({ transaction: sqlTransaction });
        }

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

export const getOrders = async (
    filters: GetOrdersFilters,
    customerId: number | null = null
) => {
    try {
        if (customerId) {
            filters.customerId = customerId;
        }
        if (!filters.sort) {
            filters.sort = "orderDate-descend";
        }
        const { page, offset } = calculatePagination(
            +filters.page || 1,
            +filters.itemsPerPage
        );

        console.log("Constructing order query from filters:", filters);
        const whereClause: any = {};
        const addressWhereClause: any = {};
        const andConditions = [];
        const orCondition: any = {};

        // If there are search terms, construct an "or" clause to add within the "and" clause
        if (filters.search) {
            orCondition[Op.or] = [
                { orderNo: { [Op.like]: `%${filters.search}%` } },
            ];

            if (filters.customerId) {
                //Construct a subquery that returns a list of orderIds with orderItems whose productNames match the search terms.
                const subquery = `
                    SELECT oi.order_id FROM OrderItems oi
                    INNER JOIN Products p ON p.productNo = oi.productNo
                    WHERE p.productName LIKE '%${filters.search}%'
                `;
                // Add a check in the or clause for any orders whose ids are contained within the list generated above
                orCondition[Op.or].push({
                    order_id: { [Op.in]: sequelize.literal(`(${subquery})`) },
                });
            } else {
                orCondition[Op.or].push(
                    { customer_id: { [Op.like]: `%${filters.search}%` } },
                    { email: { [Op.like]: `%${filters.search}%` } }
                );
            }
            andConditions.push(orCondition);
        }

        if (filters.customerId) {
            andConditions.push({ customer_id: filters.customerId });
        }

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

        console.log("Building include clause.");
        const includeClause: Includeable[] = [
            {
                model: sqlAddress,
                as: "Address",
                where: addressWhereClause,
            },
        ];

        if (filters.customerId) {
            includeClause.push({
                model: sqlOrderItem,
                as: "OrderItem",
                required: false,
                include: [
                    {
                        model: sqlProduct,
                        as: "Product",
                        required: false,
                    },
                ],
            });
        }

        console.log("Finding and counting results");
        const ordersData = (await sqlOrder.findAndCountAll({
            where: whereClause,
            order: orderArray,
            limit: +filters.itemsPerPage,
            offset: offset,
            include: includeClause,
            subQuery: false,
            nest: true,
            distinct: true,
            col: "order_id",
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

        if (filters.customerId) {
            orders = formatOrderList(orders);
        }
        return { totalCount, orders };
    } catch (error) {
        throw error;
    }
};

export const getOneOrder = async (data: {
    orderNo: string;
    email: string | undefined;
    customerId: number | null;
    loggedIn: boolean;
}) => {
    const { orderNo, email, customerId, loggedIn } = data;
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

        console.log("Will verify email:", loggedIn ? false : true);
        // Check to see that email address matches record if supplied by front end.
        if (
            email &&
            parsedOrderData.email.toLowerCase() !== email.toLowerCase()
        ) {
            throw new Error(
                `Order ${orderNo} is not associated with ${email}.`
            );
        }

        console.log("Will verify customerId:", loggedIn ? true : false);
        // If user is logged in, check to see that customerId matches record if supplied by front end.
        if (email && parsedOrderData.customer_id !== customerId) {
            throw new Error(
                `Order ${orderNo} is not associated with customer ${customerId}.`
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

// import { faker } from '@faker-js/faker';

// interface ShippingDetails {
//   shippingAddress: string;
//   shippingAddress2: string;
//   firstName: string;
//   lastName: string;
//   zipCode: string;
//   phoneNumber: string;
//   state: string;
//   city: string;
// }

// interface OrderItem {
//   productNo: string;
//   quantity: number;
//   priceAtCheckout: number;
// }

// interface OrderData {
//   cartId: number | null;
//   customerId?: number;
//   shipping: ShippingDetails;
//   email: string;
//   orderDetails: {
//     subTotal: number;
//     shipping: number;
//     tax: number;
//     totalAmount: number;
//     items: OrderItem[];
//   };
// }

// // Example list of products
// const products: { productNo: string; price: number }[] = [
//   { productNo: 'P12345', price: 10.99 },
//   { productNo: 'P54321', price: 15.5 },
//   { productNo: 'P98765', price: 8.75 },
// ];

// // Example list of customer IDs
// const customerIds: number[] = [1, 2, 3, 4, 5];

// export const generateOrders = (numOrders: number): OrderData[] => {
//   const orders: OrderData[] = [];

//   for (let i = 0; i < numOrders; i++) {
//     // Randomly choose whether to assign a customer ID
//     const customerId = Math.random() < 0.6 ? faker.helpers.arrayElement(customerIds) : undefined;

//     // Generate shipping details
//     const shipping: ShippingDetails = {
//       shippingAddress: faker.location.streetAddress(),
//       shippingAddress2: Math.random() < 0.3 ? faker.location.secondaryAddress() : '',
//       firstName: faker.person.firstName(),
//       lastName: faker.person.lastName(),
//       city: faker.location.city(),
//       state: faker.location.stateAbbr(),
//       zipCode: faker.location.zipCode(),
//       phoneNumber: faker.phone.number(),
//     };

//     const email = faker.internet.email(shipping.firstName, shipping.lastName);

//     // Generate random items for the order
//     const numItems = faker.number.int({ min: 1, max: 5 });
//     const items: OrderItem[] = [];
//     let subTotal = 0;

//     for (let j = 0; j < numItems; j++) {
//       const product = faker.helpers.arrayElement(products);
//       const quantity = faker.number.int({ min: 1, max: 4 });
//       const priceAtCheckout = product.price;

//       subTotal += priceAtCheckout * quantity;

//       items.push({
//         productNo: product.productNo,
//         quantity,
//         priceAtCheckout,
//       });
//     }

//     // Calculate shipping cost, tax, and total amount
//     const shippingCost = 9.99;
//     const tax = parseFloat(((subTotal + shippingCost) * 0.06).toFixed(2));
//     const totalAmount = parseFloat((subTotal + shippingCost + tax).toFixed(2));

//     const order: OrderData = {
//       cartId: null, // Cart ID remains null unless specified
//       customerId,
//       shipping,
//       email,
//       orderDetails: {
//         subTotal: parseFloat(subTotal.toFixed(2)),
//         shipping: parseFloat(shippingCost.toFixed(2)),
//         tax,
//         totalAmount,
//         items,
//       },
//     };

//     orders.push(order);
//   }

//   return orders;
// };

// // Generate 100 orders for testing
// const testOrders = generateOrders(100);
// console.log(testOrders);
