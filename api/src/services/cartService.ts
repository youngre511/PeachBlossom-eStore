import sequelize from "../models/mysql/index.js";
import { Model } from "sequelize-typescript";
import { sqlProduct } from "../models/mysql/sqlProductModel.js";
import { sqlPromotion } from "../models/mysql/sqlPromotionModel.js";
import { sqlCart } from "../models/mysql/sqlCartModel.js";
import { sqlCartItem } from "../models/mysql/sqlCartItemModel.js";
import { sqlInventory } from "../models/mysql/sqlInventoryModel.js";
import { Op, Transaction, WhereOptions } from "sequelize";
import { JoinReqCart, RawJoinReqProduct } from "./serviceTypes.js";

// Types and Interfaces

// Services

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

export const getCart = async (Args: {
    cartId?: number;
    customerId?: number;
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
        })) as unknown as JoinReqCart;

        const updatedCart = extractCartData(updatedCartRaw);

        if (!updatedCart) {
            throw new Error("Unable to retrieve cart state");
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

export const addToCart = async (
    productNo: string,
    cartId: number | null,
    quantity: number,
    thumbnailUrl: string,
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
            await sqlTransaction.commit();
            // Fetch the updated cart. Format and return data to update store.
            const returnCartObj = await getCart({ cartId: cartId as number });

            if (!returnCartObj) {
                throw new Error("Unable to retrieve new cart state");
            }

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
            cart = await sqlCart.create({}, { transaction: sqlTransaction });
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
                        as: "productPromotions",
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

            const promotionId =
                promotions.length > 0 ? promotions[0].promotionId : undefined;

            let finalPrice: number;

            // If there is an active promotion, calculate final price. Otherwise, set final price equal to regular price
            if (promotionId) {
                const promo = promotions[0];
                if (promo.discountType === "percentage") {
                    finalPrice =
                        product.price - promo.discountValue * product.price;
                } else {
                    finalPrice = product.price - promo.discountValue;
                }
            } else {
                finalPrice = product.price;
            }

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

        const cart = (await sqlCart.findOne({
            where: { cart_id: cartId },
            include: [{ model: sqlCartItem, as: "CartItem" }],
            transaction: sqlTransaction,
            lock: true,
            nest: true,
        })) as any;

        if (!cart) {
            throw new Error("Invalid Cart Id");
        }

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

        let cartItem = cart.CartItem.find(
            (item: any) => item.dataValues.productNo === productNo
        );

        if (!cartItem) {
            throw new Error("Item not in cart");
        }

        await sqlCartItem.update(
            { quantity: quantity },
            {
                where: { cart_id: cartId, productNo: productNo },
                transaction: sqlTransaction,
            }
        );

        await sqlTransaction.commit();

        // Fetch the updated cart. Format and return data to update store.
        const returnCartObj = await getCart({ cartId });

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

export const deleteFromCart = async (productNo: string, cartId: number) => {
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

        const cart = (await sqlCart.findOne({
            where: { cart_id: cartId },
            include: [{ model: sqlCartItem, as: "CartItem" }],
            transaction: sqlTransaction,
            lock: true,
            nest: true,
        })) as unknown as JoinReqCart;

        if (!cart) {
            throw new Error("Invalid Cart Id");
        }

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

        await sqlTransaction.commit();

        // Fetch the updated cart. Format and return data to update store.
        const returnCartObj = await getCart({ cartId });

        if (!returnCartObj) {
            throw new Error("Unable to retrieve new cart state");
        }
        return {
            success: true,
            message: "Item successfully deleted",
            cart: returnCartObj,
        };
    } catch (error) {
        await sqlTransaction.rollback();
        throw error;
    }
};

export const mergeCarts = async (cartId1: number, cartId2: number) => {
    const sqlTransaction = await sequelize.transaction();

    try {
        const cart2 = (await sqlCart.findOne({
            where: { cart_id: cartId2 },
            include: [{ model: sqlCartItem, as: "CartItem" }],
            transaction: sqlTransaction,
        })) as unknown as JoinReqCart;
        if (!cart2) {
            throw new Error("Invalid Cart Id");
        }

        for (const item of cart2.CartItem) {
            await addToCart(
                item.dataValues.productNo,
                cartId1,
                item.dataValues.quantity,
                item.dataValues.thumbnailUrl as string,
                sqlTransaction
            );
        }

        // Fetch the updated cart. Format and return data to update store.
        const returnCartObj = await getCart({ cartId: cartId1 });

        if (!returnCartObj) {
            throw new Error(
                "Unable to retrieve new cart state during cart merge"
            );
        }
        await sqlTransaction.commit();
        return {
            success: true,
            message: "Carts successfully merged",
            cart: returnCartObj,
        };
    } catch (error) {
        await sqlTransaction.rollback();
        throw error;
    }
};
