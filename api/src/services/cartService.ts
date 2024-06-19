import sequelize from "../models/mysql";
import { sqlProduct } from "../models/mysql/sqlProductModel";
import { sqlPromotion } from "../models/mysql/sqlPromotionModel";
import { sqlCart } from "../models/mysql/sqlCartModel";
import { sqlCartItem } from "../models/mysql/sqlCartItemModel";
import { sqlInventory } from "../models/mysql/sqlInventoryModel";
import { Op } from "sequelize";

// Types and Interfaces

interface Product {
    id: number;
    productNo: string;
    productName: string;
    price: number;
    description: string;
    category_id: number;
    subCategory_id?: number;
    Inventory: {
        available: number;
    };
}

interface JoinReqCartItem {
    cart_item_id: number;
    cart_id: number;
    productNo: string;
    Product: Product;
    thumbnailUrl?: string;
    promotionId?: string;
    quantity: number;
    finalPrice: number;
}

interface JoinReqCart {
    cart_id: number;
    customer_id?: number;
    CartItem: JoinReqCartItem[];
}

// Services

exports.getCartById = async (cartId: number) => {
    try {
        const cart = (await sqlCart.findOne({
            where: { cart_id: cartId },
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
                                    attributes: ["available"],
                                },
                            ],
                        },
                    ],
                },
            ],
        })) as unknown as JoinReqCart;

        if (!cart) {
            throw new Error("Unable to retrieve cart");
        }

        let subTotal = 0;

        const itemsArr = cart.CartItem.map((item) => {
            subTotal += item.finalPrice * item.quantity;
            const itemObj = {
                productNo: item.productNo,
                name: item.Product.productName,
                price: item.Product.price,
                discountPrice: item.finalPrice,
                quantity: item.quantity,
                thumbnailUrl: item.thumbnailUrl,
                productUrl: `/product/${item.productNo}`,
                maxAvailable: item.Product.Inventory.available,
            };
            return itemObj;
        });

        const returnCartObj = {
            items: itemsArr,
            subTotal: subTotal,
            cartId: cart.cart_id,
        };
    } catch (error) {
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error("Error retrieving cart: " + error.message);
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error("An unknown error occurred while retrieving cart");
        }
    }
};

exports.getCustomerCart = async (customerId: number) => {
    console.log("yes");
};

exports.addToCart = async (
    productNo: string,
    cartId: number | null,
    quantity: number,
    thumbnailUrl: string
) => {
    const sqlTransaction = await sequelize.transaction();
    let cartExists = cartId ? true : false;
    console.log(productNo, cartId, quantity, thumbnailUrl);
    try {
        const product = await sqlProduct.findOne({
            where: { productNo: productNo },
            attributes: ["id", "productNo"],
            transaction: sqlTransaction,
        });
        if (!product) {
            throw new Error("ProductNo not found in database");
        }

        console.log("still running1");
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
        console.log("still running2");
        const promotionId =
            promotions.length > 0 ? promotions[0].promotionId : undefined;

        let finalPrice: number;
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
        console.log("still running3");
        let cart;
        if (cartExists) {
            cart = await sqlCart.findOne({
                where: { cart_id: cartId },
                include: [{ model: sqlCartItem, as: "CartItem" }],
                transaction: sqlTransaction,
            });
            if (!cart) {
                cartExists = false;
            }
        }
        console.log("still running4");
        if (!cartExists) {
            cart = await sqlCart.create({}, { transaction: sqlTransaction });
            cartId = cart.cart_id;
        }

        if (!cart) {
            throw new Error("Cart creation failed");
        }

        let cartItem = null;
        if (cart.cartItems) {
            cartItem = cart.cartItems.find(
                (item) => item.productNo === productNo
            );
        }
        console.log("still running5");
        if (cartItem) {
            cartItem.quantity += quantity;
            cartItem.promotionId = promotionId;
            cartItem.finalPrice = finalPrice;
            await cartItem.save({ transaction: sqlTransaction });
        } else {
            await sqlCartItem.create(
                {
                    cart_id: cartId,
                    productNo: product.productNo,
                    quantity: quantity,
                    promotionId: promotionId,
                    thumbnailUrl: thumbnailUrl,
                    finalPrice: finalPrice,
                },
                { transaction: sqlTransaction }
            );
        }
        console.log("still running6");
        await sqlTransaction.commit();

        console.log(cartId);
        // const update = await sqlCart.findOne({
        //     where: { cart_id: cartId },
        //     include: [
        //         {
        //             model: sqlCartItem,
        //             as: "CartItem",
        //             include: [
        //                 {
        //                     model: sqlProduct,
        //                     as: "Product",
        //                     attributes: [
        //                         "productNo",
        //                         "productName",
        //                         "price",
        //                         "description",
        //                     ],
        //                 },
        //             ],
        //             attributes: [
        //                 "cart_item_id",
        //                 "cart_id",
        //                 "productNo",
        //                 "quantity",
        //                 "finalPrice",
        //             ],
        //         },
        //     ],
        // });

        const update = await sqlCart.findOne({
            where: { cart_id: cartId },
            include: [
                {
                    model: sqlCartItem,
                    as: "CartItem",
                    include: [
                        {
                            model: sqlProduct,
                            as: "Product",
                            attributes: [
                                "productNo",
                                "productName",
                                "price",
                                "description",
                            ],
                            include: [
                                {
                                    model: sqlInventory,
                                    as: "Inventory",
                                    attributes: ["available"],
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        console.log("6.25", JSON.stringify(update?.toJSON(), null, 2));

        const productt = await sqlProduct.findOne({
            where: { productNo: "pl-b96838c3" },
            include: [
                {
                    model: sqlInventory,
                    as: "Inventory",
                    attributes: ["stock", "reserved", "available"],
                },
            ],
        });

        console.log(
            "Product Inventory:",
            JSON.stringify(productt?.toJSON(), null, 2)
        );

        let updatedCart = (await sqlCart.findOne({
            where: { cart_id: cartId },
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
                                    attributes: ["available"],
                                },
                            ],
                        },
                    ],
                },
            ],
        })) as unknown as JoinReqCart;

        // updatedCart = JSON.parse(updatedCart.toJSON());

        console.log("still running6.5");
        console.log(updatedCart);

        if (!updatedCart) {
            throw new Error("Unable to retrieve new cart state");
        }

        let subTotal = 0;

        const itemsArr = updatedCart.CartItem.map((item) => {
            subTotal += item.finalPrice * item.quantity;
            const itemObj = {
                productNo: item.productNo,
                name: item.Product.productName,
                price: item.Product.price,
                discountPrice: item.finalPrice,
                quantity: item.quantity,
                thumbnailUrl: item.thumbnailUrl,
                productUrl: `/product/${item.productNo}`,
                maxAvailable: item.Product.Inventory.available,
            };
            return itemObj;
        });

        const returnCartObj = {
            items: itemsArr,
            subTotal: subTotal,
            cartId: updatedCart.cart_id,
        };
        console.log("still running7");
        return {
            success: true,
            message: "Item added to cart successfully",
            cartId: returnCartObj,
        };
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error("Error adding item to cart: " + error.message);
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error(
                "An unknown error occurred while adding item to cart"
            );
        }
    }
};

exports.updateItemQuantity = async (
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
        });
        if (!product) {
            throw new Error("ProductNo not found in database");
        }

        const cart = await sqlCart.findOne({
            where: { cart_id: cartId },
            include: [{ model: sqlCartItem, as: "CartItem" }],
            transaction: sqlTransaction,
        });

        if (!cart) {
            throw new Error("Invalid Cart Id");
        }

        let cartItem = cart.cartItems.find(
            (item) => item.productNo === productNo
        );

        if (!cartItem) {
            throw new Error("Item not in cart");
        }

        cartItem.quantity = quantity;
        await cartItem.save({ transaction: sqlTransaction });

        await sqlTransaction.commit();

        const updatedCart = (await sqlCart.findOne({
            where: { cart_id: cartId },
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
                                    attributes: ["available"],
                                },
                            ],
                        },
                    ],
                },
            ],
        })) as unknown as JoinReqCart;

        if (!updatedCart) {
            throw new Error("Unable to retrieve new cart state");
        }

        let subTotal = 0;
        let itemCount = 0;

        const itemsArr = updatedCart.CartItem.map((item) => {
            subTotal += item.finalPrice * item.quantity;
            itemCount += item.quantity;
            const itemObj = {
                productNo: item.productNo,
                name: item.Product.productName,
                price: item.Product.price,
                discountPrice: item.finalPrice,
                quantity: item.quantity,
                thumbnailUrl: item.thumbnailUrl,
                productUrl: `/product/${item.productNo}`,
                maxAvailable: item.Product.Inventory.available,
            };
            return itemObj;
        });

        const returnCartObj = {
            items: itemsArr,
            subTotal: subTotal,
            cartId: updatedCart.cart_id,
            numberOfItems: itemCount,
        };

        return {
            success: true,
            message: "Item added to cart successfully",
            cart: returnCartObj,
        };
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error(
                "Error updating item quantity in cart: " + error.message
            );
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error(
                "An unknown error occurred while updating item quantity in cart"
            );
        }
    }
};

exports.deleteFromCart = async (productNo: string, cartId: number) => {
    const sqlTransaction = await sequelize.transaction();

    try {
        const product = await sqlProduct.findOne({
            where: { productNo: productNo },
            attributes: ["id", "productNo"],
            transaction: sqlTransaction,
        });
        if (!product) {
            throw new Error("ProductNo not found in database");
        }

        const cart = await sqlCart.findOne({
            where: { cart_id: cartId },
            include: [{ model: sqlCartItem, as: "CartItem" }],
            transaction: sqlTransaction,
        });

        if (!cart) {
            throw new Error("Invalid Cart Id");
        }

        let cartItem = cart.cartItems.find(
            (item) => item.productNo === productNo
        );

        if (!cartItem) {
            throw new Error("Item not in cart");
        }

        const result = await sqlCartItem.destroy({
            where: {
                cart_item_id: cartItem.cart_item_id,
            },
            transaction: sqlTransaction,
        });

        if (result === 0) {
            throw new Error("Cart item not found or already deleted");
        }

        await sqlTransaction.commit();

        const updatedCart = (await sqlCart.findOne({
            where: { cart_id: cartId },
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
                                    attributes: ["available"],
                                },
                            ],
                        },
                    ],
                },
            ],
        })) as unknown as JoinReqCart;

        if (!updatedCart) {
            throw new Error("Unable to retrieve new cart state");
        }

        let subTotal = 0;
        let itemCount = 0;

        const itemsArr = updatedCart.CartItem.map((item) => {
            subTotal += item.finalPrice * item.quantity;
            itemCount += item.quantity;
            const itemObj = {
                productNo: item.productNo,
                name: item.Product.productName,
                price: item.Product.price,
                discountPrice: item.finalPrice,
                quantity: item.quantity,
                thumbnailUrl: item.thumbnailUrl,
                productUrl: `/product/${item.productNo}`,
                maxAvailable: item.Product.Inventory.available,
            };
            return itemObj;
        });

        const returnCartObj = {
            items: itemsArr,
            subTotal: subTotal,
            cartId: updatedCart.cart_id,
            numberOfItems: itemCount,
        };

        return {
            success: true,
            message: "Item added to cart successfully",
            cart: returnCartObj,
        };
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error("Error removing item from cart: " + error.message);
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error(
                "An unknown error occurred while removing item from cart"
            );
        }
    }
};
