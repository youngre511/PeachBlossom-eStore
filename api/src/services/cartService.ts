import sequelize from "../models/mysql/index.js";
import { Model } from "sequelize-typescript";
import { sqlProduct } from "../models/mysql/sqlProductModel.js";
import { sqlPromotion } from "../models/mysql/sqlPromotionModel.js";
import { sqlCart } from "../models/mysql/sqlCartModel.js";
import { sqlCartItem } from "../models/mysql/sqlCartItemModel.js";
import { sqlInventory } from "../models/mysql/sqlInventoryModel.js";
import { Op, Transaction, WhereOptions } from "sequelize";
import { JoinReqCart, RawJoinReqProduct } from "./_serviceTypes.js";
import { sqlCustomer } from "../models/mysql/sqlCustomerModel.js";
import { calculateFinalPrice } from "../utils/calculateFinalPrice.js";

/**
 * @description This is a helper function to transform raw cart data returned by sql queries into a front-end-usable format.
 */

export const extractCartData = (cartData: JoinReqCart) => {
    const updatedCart = cartData.get();
    if (updatedCart.CartItem) {
        const parsedItems = updatedCart.CartItem.map((item: any) => {
            const itemData = item.get();
            if (itemData.Product) {
                itemData.Product = itemData.Product.get();
                if (itemData.Product.Inventory) {
                    itemData.Product.Inventory =
                        itemData.Product.Inventory.get();
                }
            }
            return itemData;
        });
        updatedCart.CartItem = parsedItems;
    }
    return updatedCart;
};

/**
 * @description This function looks up a user's cart by either cartId or customerId.
 * @param cartId (required if customerId is not provided)
 * @param customerId (required if cartId is not provided)
 * @param [transaction] - an existing sqlTransaction, used when function is called by another service with its own transaction
 * @returns a cart object
 */

export const getCart = async (Args: {
    cartId?: number;
    customerId?: number;
    transaction?: Transaction;
}) => {
    try {
        if (!Args.cartId && !Args.customerId) {
            throw new Error("Must provide either cartId or customerId");
        }

        const whereClause: WhereOptions = {};
        if (Args.cartId) {
            whereClause["cart_id"] = Args.cartId;
        } else {
            whereClause["customer_id"] = Args.customerId;
        }

        const updatedCartRaw = (await sqlCart.findOne({
            where: whereClause,
            include: [
                {
                    model: sqlCartItem,
                    as: "CartItem",
                    include: [
                        {
                            model: sqlProduct,
                            as: "Product",
                            include: [
                                {
                                    model: sqlInventory,
                                    as: "Inventory",
                                },
                            ],
                        },
                    ],
                },
            ],
            nest: true,
            transaction: Args.transaction,
        })) as unknown as JoinReqCart;

        if (!updatedCartRaw) {
            console.log("Sending back blank");
            return {
                items: [],
                subTotal: "0.00",
                cartId: null,
                numberOfItems: 0,
            };
        }

        const updatedCart = extractCartData(updatedCartRaw);

        if (!updatedCart) {
            throw new Error("Unable to parse cart state");
        }

        let subTotal = 0;
        let itemCount = 0;

        const itemsArr = updatedCart.CartItem.map((item: any) => {
            subTotal += item.finalPrice * item.quantity;
            itemCount += item.quantity;
            const discountPrice =
                item.finalPrice !== item.Product.price ? item.finalPrice : null;
            const itemObj = {
                productNo: item.productNo,
                name: item.Product.productName,
                price: item.Product.price,
                discountPrice: discountPrice,
                quantity: item.quantity,
                thumbnailUrl: item.thumbnailUrl,
                productUrl: `/product/${item.productNo}`,
                maxAvailable: item.Product.Inventory.available,
            };
            return itemObj;
        });

        const returnCartObj = {
            items: itemsArr,
            subTotal: subTotal.toFixed(2),
            cartId: updatedCart.cart_id,
            numberOfItems: itemCount,
        };

        return returnCartObj;
    } catch (error) {
        throw error;
    }
};

/**
 * @description This function adds an item to a cart.
 * If there is no existing cart (no cartId is provided), a new cart is created.
 * If a customerId is provided, the customerId is attached to the new or existing cart
 */

export const addToCart = async (
    productNo: string,
    cartId: number | null,
    quantity: number,
    thumbnailUrl: string,
    customerId: number | null,
    transaction?: Transaction
) => {
    const sqlTransaction = transaction
        ? transaction
        : await sequelize.transaction();
    let cartExists = cartId ? true : false;

    try {
        // Find product record
        const product = (await sqlProduct.findOne({
            where: { productNo: productNo },
            include: [
                {
                    model: sqlInventory,
                    as: "Inventory",
                    attributes: [
                        "inventory_id",
                        "reserved",
                        "product_id",
                        [sequelize.literal("stock - reserved"), "available"],
                    ],
                },
            ],
            transaction: sqlTransaction,
            raw: true,
        })) as unknown as RawJoinReqProduct;
        if (!product) {
            throw new Error("ProductNo not found in database");
        }

        if (product.status !== "active") {
            throw new Error(
                `Product ${product.productName} is no longer available`
            );
        }

        if (quantity > product["Inventory.available"]) {
            if (!transaction) {
                throw new Error(
                    `Insufficient stock. Tried add ${quantity} ${product.productName} unit(s) to cart, but only ${product["Inventory.available"]} are available.`
                );
            }

            // Fetch the updated cart. Format and return data to update store.
            const returnCartObj = await getCart({
                cartId: cartId as number,
                transaction: sqlTransaction,
            });

            if (!returnCartObj) {
                throw new Error("Unable to retrieve new cart state");
            }

            await sqlTransaction.commit();

            return {
                success: false,
                message: `Insufficient stock. Tried add ${quantity} ${product.productName} units to cart, but only ${product["Inventory.available"]} are available.`,
                cart: returnCartObj,
            };
        }

        // If a cartId is supplied, fetch cart record from cart table. If cart cannot be found, set cartExists equal to false.
        let cart;
        let cartItem = null;
        if (cartExists) {
            cart = await sqlCart.findOne({
                where: { cart_id: cartId },
                include: [{ model: sqlCartItem, as: "CartItem" }],
                transaction: sqlTransaction,
                nest: true,
            });
            console.log("cart:", cart);
            if (!cart) {
                cartExists = false;
            } else {
                //Search cart items to determine whether product already exists in cart.
                if (cart.dataValues.CartItem) {
                    cartItem = cart.dataValues.CartItem.find(
                        (item: any) => item.dataValues.productNo === productNo
                    );
                }
            }
        }

        // If cartExists is false, create new cart.
        if (!cartExists) {
            cart = await sqlCart.create(
                { customer_id: customerId },
                { transaction: sqlTransaction }
            );
            cartId = cart.cart_id;
        }

        if (!cart) {
            throw new Error("Cart creation failed");
        }

        // If the product is already in the cart, increment the quantity, otherwise, create a new cart item.
        if (cartItem) {
            const updates: Record<string, any> = {};
            updates["quantity"] = cartItem.quantity + quantity;
            await sqlCartItem.increment("quantity", {
                by: quantity,
                where: { cart_item_id: cartItem.cart_item_id },
                transaction: sqlTransaction,
            });
        } else {
            //Find any current and active promotions
            const currentDate = new Date();
            const promotions = await sqlPromotion.findAll({
                include: [
                    {
                        model: sqlProduct,
                        as: "products",
                        where: { productNo: product.productNo },
                        through: {
                            attributes: [],
                        },
                    },
                ],
                where: {
                    active: true,
                    startDate: { [Op.lte]: currentDate },
                    endDate: { [Op.gte]: currentDate },
                },
            });

            const { finalPrice, promotionId } = await calculateFinalPrice(
                product
            );

            await sqlCartItem.create(
                {
                    cart_id: cartId,
                    productNo: product.productNo,
                    quantity: quantity,
                    promotionId: promotionId,
                    thumbnailUrl: thumbnailUrl,
                    finalPrice: finalPrice,
                    reserved: false,
                },
                { transaction: sqlTransaction }
            );
        }

        // Commit transaction unless function has received transaction as an argument
        if (transaction) {
            return;
        }
        await sqlTransaction.commit();

        // Fetch the updated cart. Format and return data to update store.
        const returnCartObj = await getCart({ cartId: cartId as number });

        if (!returnCartObj) {
            throw new Error("Unable to retrieve new cart state");
        }

        return {
            success: true,
            message: "Item added to cart successfully",
            cart: returnCartObj,
        };
    } catch (error) {
        await sqlTransaction.rollback();
        throw error;
    }
};

/**
 * @description This function updates the quantity for an item in an existing cart.
 */
export const updateItemQuantity = async (
    productNo: string,
    cartId: number,
    quantity: number
) => {
    const sqlTransaction = await sequelize.transaction();

    try {
        const product = await sqlProduct.findOne({
            where: { productNo: productNo },
            attributes: ["id", "productNo"],
            transaction: sqlTransaction,
            raw: true,
        });
        if (!product) {
            throw new Error("ProductNo not found in database");
        }

        // Look up and lock cart
        const cart = (await sqlCart.findOne({
            where: { cart_id: cartId },
            include: [{ model: sqlCartItem, as: "CartItem" }],
            transaction: sqlTransaction,
            lock: true,
            nest: true,
        })) as any;

        // If no cart with that Id exists, use getCart to create a new cart with the provided id and return the cart object.
        if (!cart) {
            const returnCartObj = await getCart({
                cartId: cartId,
                transaction: sqlTransaction,
            });
            return {
                success: false,
                message: "CartId is no longer valid",
                cart: returnCartObj,
            };
        }

        // Before updating quantities, lock the cart item rows.
        await cart.reload({
            include: [
                {
                    model: sqlCartItem,
                    as: "CartItem",
                    required: false,
                },
            ],
            transaction: sqlTransaction,
            lock: {
                level: sqlTransaction.LOCK.UPDATE,
                of: sqlCartItem, // Lock the cart items
            },
        });

        // Find the relevant cart item. If it does not exist, create a new cart item with the provided quantity. Otherwise, update existing row.
        let cartItem = cart.CartItem.find(
            (item: any) => item.dataValues.productNo === productNo
        );

        if (!cartItem) {
            await addToCart(
                productNo,
                cartId,
                quantity,
                product.thumbnailUrl || "",
                null,
                sqlTransaction
            );
        } else {
            await sqlCartItem.update(
                { quantity: quantity },
                {
                    where: { cart_id: cartId, productNo: productNo },
                    transaction: sqlTransaction,
                }
            );
        }

        await sqlTransaction.commit();

        // Fetch the updated cart. Format and return data to update store.
        const returnCartObj = await getCart({ cartId });

        if (!returnCartObj) {
            throw new Error("Unable to retrieve new cart state");
        }

        return {
            success: true,
            message: "Item quantity successfully updated",
            cart: returnCartObj,
        };
    } catch (error) {
        await sqlTransaction.rollback();
        throw error;
    }
};

/**
 * @description This function deletes an item from a specified cart. If deleting the item
 */
export const deleteFromCart = async (
    productNo: string,
    cartId: number,
    transaction?: Transaction
) => {
    const sqlTransaction = transaction
        ? transaction
        : await sequelize.transaction();

    try {
        // Verify that the productNo is valid.
        const product = await sqlProduct.findOne({
            where: { productNo: productNo },
            attributes: ["id", "productNo"],
            transaction: sqlTransaction,
            raw: true,
        });
        if (!product) {
            throw new Error("ProductNo not found in database");
        }

        // Look up and lock the cart.

        const cart = (await sqlCart.findOne({
            where: { cart_id: cartId },
            include: [{ model: sqlCartItem, as: "CartItem" }],
            transaction: sqlTransaction,
            lock: true,
            nest: true,
        })) as unknown as JoinReqCart;

        if (!cart) {
            const returnCartObj = await getCart({
                cartId: cartId,
                transaction: sqlTransaction,
            });

            return {
                success: false,
                message: "CartId no longer exists",
                cart: returnCartObj,
            };
        }

        // Lock the cart item rows.
        await cart.reload({
            include: [
                {
                    model: sqlCartItem,
                    as: "CartItem",
                    required: false,
                },
            ],
            transaction: sqlTransaction,
            lock: {
                level: sqlTransaction.LOCK.UPDATE,
                of: sqlCartItem, // Lock the cart items
            },
        });
        // Record the number of distinct products in the cart.
        const itemsBeforeDelete = cart.CartItem.length;

        // Find the relevant cart item and destroy it
        let cartItem = cart.CartItem.find(
            (item: any) => item.dataValues.productNo === productNo
        );

        if (!cartItem) {
            throw new Error("Item not in cart");
        }

        const result = await sqlCartItem.destroy({
            where: {
                cart_item_id: cartItem.dataValues.cart_item_id,
            },
            transaction: sqlTransaction,
        });

        if (result === 0) {
            throw new Error("Cart item not found or already deleted");
        }

        let returnCartObj;

        // If the cart is empty after deletion, delete the cart itself and return an empty cart. Otherwise, return the updated cart.
        if (itemsBeforeDelete === 1) {
            const result = await sqlCart.destroy({
                where: { cart_id: cartId },
                transaction: sqlTransaction,
            });
            if (result === 0) {
                throw new Error("Failed to delete empty cart");
            }
            returnCartObj = {
                items: [],
                subTotal: "0.00",
                cartId: null,
                numberOfItems: 0,
            };
        } else {
            // Fetch the updated cart. Format and return data to update store.
            returnCartObj = await getCart({
                cartId,
                transaction: sqlTransaction,
            });

            if (!returnCartObj) {
                throw new Error("Unable to retrieve new cart state");
            }
        }

        if (!transaction) {
            await sqlTransaction.commit();
        }

        return {
            success: true,
            message: "Item successfully deleted",
            cart: returnCartObj,
        };
    } catch (error) {
        if (!transaction) {
            await sqlTransaction.rollback();
        }
        throw error;
    }
};

/**
 * @description This function handles cart logic for login.
 * It takes in a customerId, an optional cartId, and an sql transaction. It then checks for the existence of carts associated with the provided cartId and the provided customer record.
 * It returns the existing cartId (if no customer-associated cartId is found) or the customer cartId. If both customer and existing cartIds exist, the latter is merged into the former.
 */

export const loginCartProcessing = async (
    customerId: number,
    cartId: number | null,
    transaction: Transaction
) => {
    let newCartId: number | null = null;

    console.log("checking for userCart");
    let userCart = await sqlCart.findOne({
        where: { customer_id: customerId },
    });

    if (cartId) {
        console.log("checking for current cart");
        let cart = await sqlCart.findOne({
            where: { cart_id: cartId },
        });

        if (!cart && userCart) {
            console.log(
                "Unable to retrieve current cart. Loading user cart instead."
            );
            newCartId = userCart.dataValues.cart_id;
        } else if (cart && userCart) {
            console.log("existing user cart exists");
            console.log("merging carts:", userCart.dataValues.cart_id, cartId);
            newCartId = await mergeCarts(
                userCart.dataValues.cart_id,
                cartId,
                transaction
            );
        } else if (cart && !userCart) {
            console.log(
                "No user cart exists. Assigning cart " + cartId + "to user"
            );
            newCartId = await assignCartToCustomer(
                cartId,
                customerId,
                transaction
            );
        }
    } else if (userCart) {
        console.log("No current cart. Loading user");
        newCartId = userCart.dataValues.cart_id;
    }

    return newCartId;
};

/**
 * @description This function takes two valid cartIds and merges the second cart into the first cart, privileging the quantities contained in the first cart if the same productNo is found in both. The second cart is destroyed.
 */

export const mergeCarts = async (
    primeCartId: number,
    secondaryCartId: number,
    sqlTransaction: Transaction
) => {
    try {
        const primaryCart = (await sqlCart.findOne({
            where: { cart_id: primeCartId },
            include: [{ model: sqlCartItem, as: "CartItem" }],
            transaction: sqlTransaction,
            lock: true,
        })) as unknown as JoinReqCart;
        if (!primaryCart) {
            throw new Error("Invalid Primary Cart Id");
        }

        const productNos = primaryCart.CartItem.map(
            (item) => item.dataValues.productNo
        );

        const secondaryCart = (await sqlCart.findOne({
            where: { cart_id: secondaryCartId },
            include: [{ model: sqlCartItem, as: "CartItem" }],
            transaction: sqlTransaction,
            lock: true,
        })) as unknown as JoinReqCart;
        if (!secondaryCart) {
            throw new Error("Invalid Secondary Cart Id");
        }

        for (const item of secondaryCart.CartItem) {
            if (!productNos.includes(item.dataValues.productNo)) {
                await addToCart(
                    item.dataValues.productNo,
                    primeCartId,
                    item.dataValues.quantity,
                    item.dataValues.thumbnailUrl as string,
                    null,
                    sqlTransaction
                );
            }
            await deleteFromCart(
                item.dataValues.productNo,
                secondaryCartId,
                sqlTransaction
            );
        }

        await secondaryCart.destroy({ transaction: sqlTransaction });

        return primeCartId;
    } catch (error) {
        throw error;
    }
};

/**
 * @description This function associates a provided customerId with an existing cart.
 */

export const assignCartToCustomer = async (
    cartId: number,
    customerId: number,
    sqlTransaction: Transaction
) => {
    try {
        const customer = await sqlCustomer.findOne({
            where: { customer_id: customerId },
            transaction: sqlTransaction,
        });
        if (!customer) throw new Error("Invalid customer id");

        const cart = await sqlCart.findOne({
            where: { cart_id: cartId },
            transaction: sqlTransaction,
        });

        if (!cart) {
            throw new Error("Invalid Cart Id");
        }

        if (
            cart.dataValues.customer_id &&
            cart.dataValues.customer_id !== customerId
        ) {
            throw new Error("Cart already associated with another customer");
        } else if (cart.dataValues.customer_id) {
            throw new Error("Cart already assigned to customer");
        }

        await cart.update({ customer_id: customerId });

        // Fetch the updated cart. Format and return data to update store.

        return cartId;
    } catch (error) {
        throw error;
    }
};
