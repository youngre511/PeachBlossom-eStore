import sequelize from "../models/mysql";
import { sqlProduct } from "../models/mysql/sqlProductModel";
import { sqlPromotion } from "../models/mysql/sqlPromotionModel";
import { sqlCart } from "../models/mysql/sqlCartModel";
import { sqlCartItem } from "../models/mysql/sqlCartItemModel";
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

exports.addItemToCart = async (
    productNo: string,
    cartId: number | null,
    quantity: number,
    thumbnailUrl: string
) => {
    const sqlTransaction = await sequelize.transaction();
    let cartExists = cartId ? true : false;

    try {
        const product = await sqlProduct.findOne({
            where: { productNo: productNo },
            attributes: ["id", "productNo"],
            transaction: sqlTransaction,
        });
        if (!product) {
            throw new Error("ProductNo not found in database");
        }

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

        if (!cartExists) {
            cart = await sqlCart.create({}, { transaction: sqlTransaction });
        }

        if (!cart) {
            throw new Error("Cart creation failed");
        }

        let cartItem = cart?.cartItems.find(
            (item) => item.productNo === productNo
        );

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
                        },
                    ],
                },
            ],
        })) as unknown as JoinReqCart;

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
            };
            return itemObj;
        });

        const returnCartObj = {
            items: itemsArr,
            subTotal: subTotal,
            cartId: updatedCart.cart_id,
        };

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

exports.removeItemFromCart = async (
    productNo: string,
    cartId: number | null,
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

        if (cartItem.quantity === quantity) {
            const result = await sqlCartItem.destroy({
                where: {
                    cart_item_id: cartItem.cart_item_id,
                },
                transaction: sqlTransaction,
            });

            if (result === 0) {
                throw new Error("Cart item not found or already deleted");
            }
        } else {
            cartItem.quantity -= quantity;
            await cartItem.save({ transaction: sqlTransaction });
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
                        },
                    ],
                },
            ],
        })) as unknown as JoinReqCart;

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
            };
            return itemObj;
        });

        const returnCartObj = {
            items: itemsArr,
            subTotal: subTotal,
            cartId: updatedCart.cart_id,
        };

        return {
            success: true,
            message: "Item added to cart successfully",
            cartId: returnCartObj,
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
