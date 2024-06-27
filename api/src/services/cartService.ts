import sequelize from "../models/mysql/index.js";
import { sqlProduct } from "../models/mysql/sqlProductModel.js";
import { sqlPromotion } from "../models/mysql/sqlPromotionModel.js";
import { sqlCart } from "../models/mysql/sqlCartModel.js";
import { sqlCartItem } from "../models/mysql/sqlCartItemModel.js";
import { sqlInventory } from "../models/mysql/sqlInventoryModel.js";
import { Op, Model } from "sequelize";

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
        inventory_id: number;
        product_id: number;
        stock: number;
        reserved: number;
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
    reserved: boolean;
}

export interface JoinReqCart {
    cart_id: number;
    customer_id?: number;
    CartItem: JoinReqCartItem[];
}

interface JoinReqUpdateCart {
    cart_id: number;
    customer_id?: number;
    CartItem: (JoinReqCartItem & Model)[];
}

// Services

export const extractCartData = (cartData: any) => {
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

export const getCartById = async (cartId: number) => {
    console.log("running");
    console.log(cartId);
    try {
        let updatedCartRaw = await sqlCart.findOne({
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
                                },
                            ],
                        },
                    ],
                },
            ],
            nest: true,
        });

        // as unknown as JoinReqCart
        let updatedCart = extractCartData(updatedCartRaw);
        // Ensure CartItem is an array
        // if (updatedCart && !Array.isArray(updatedCart.CartItem)) {
        //     updatedCart.CartItem = [updatedCart.CartItem];
        // }

        if (!updatedCart) {
            throw new Error("Unable to retrieve cart state");
        }

        let subTotal = 0;
        let itemCount = 0;

        const itemsArr = updatedCart.CartItem.map((item: any) => {
            console.log(item.Product);
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
            subTotal: subTotal,
            cartId: updatedCart.cart_id,
            numberOfItems: itemCount,
        };

        return returnCartObj;
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

export const getCustomerCart = async (customerId: number) => {
    console.log("yes");
};

export const addToCart = async (
    productNo: string,
    cartId: number | null,
    quantity: number,
    thumbnailUrl: string
) => {
    console.log("addToCart cartID", cartId);
    console.log("addToCart productNo", productNo);
    const sqlTransaction = await sequelize.transaction();
    let cartExists = cartId ? true : false;
    console.log("cartExists:", cartExists);
    try {
        // Find product record
        const product = await sqlProduct.findOne({
            where: { productNo: productNo },
            transaction: sqlTransaction,
            raw: true,
        });
        if (!product) {
            throw new Error("ProductNo not found in database");
        }

        console.log("found product", product);

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

        // If a cartId is supplied, fetch cart record from cart table. If cart cannot be found, set cartExists equal to false.
        let cart;
        if (cartExists) {
            cart = await sqlCart.findOne({
                where: { cart_id: cartId },
                include: [{ model: sqlCartItem, as: "CartItem" }],
                transaction: sqlTransaction,
                raw: true,
            });
            if (!cart) {
                cartExists = false;
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

        //Search cart items to determine whether product already exists in cart.
        let cartItem = null;
        if (cart.cartItems) {
            cartItem = cart.cartItems.find(
                (item: any) => item.productNo === productNo
            );
        }

        // If the product is already in the cart, increment the quantity, otherwise, create a new cart item.
        if (cartItem) {
            cartItem.quantity += quantity;
            cartItem.promotionId = promotionId;
            cartItem.finalPrice = finalPrice;
            await cartItem.save({ transaction: sqlTransaction });
        } else {
            console.log(
                "creating item info:",
                cartId,
                product.productNo,
                quantity
            );
            const cartItemCreate = await sqlCartItem.create(
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

        // Commit transaction

        await sqlTransaction.commit();

        // Fetch the updated cart. Format and return data to update store.
        const returnCartObj = await getCartById(cartId as number);
        console.log(returnCartObj);

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
            nest: true,
        })) as any;

        if (!cart) {
            throw new Error("Invalid Cart Id");
        }
        let cartItem = cart.CartItem.find(
            (item: any) => item.dataValues.productNo === productNo
        );

        if (!cartItem) {
            throw new Error("Item not in cart");
        }

        await sqlCartItem.update(
            { quantity: quantity },
            {
                where: { cart_item_id: cartItem.dataValues.cart_item_id },
                transaction: sqlTransaction,
            }
        );

        await cart.save({ transaction: sqlTransaction });

        await sqlTransaction.commit();

        // Fetch the updated cart. Format and return data to update store.
        const returnCartObj = await getCartById(cartId);

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

export const deleteFromCart = async (productNo: string, cartId: number) => {
    const sqlTransaction = await sequelize.transaction();
    console.log("still working 1");
    console.log("productNo", productNo);
    console.log("cartId", cartId);
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
            raw: true,
            nest: true,
        })) as unknown as JoinReqCart;

        if (!cart) {
            throw new Error("Invalid Cart Id");
        }
        if (cart && !Array.isArray(cart.CartItem)) {
            cart.CartItem = [cart.CartItem];
        }

        let cartItem = cart.CartItem.find(
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

        console.log("still working, result:", result);

        if (result === 0) {
            throw new Error("Cart item not found or already deleted");
        }

        await sqlTransaction.commit();

        // Fetch the updated cart. Format and return data to update store.
        const returnCartObj = await getCartById(cartId);

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

export const mergeCarts = async (cartId1: number, cartId2: number) => {
    const sqlTransaction = await sequelize.transaction();

    try {
        const cart2 = (await sqlCart.findOne({
            where: { cart_id: cartId2 },
            include: [{ model: sqlCartItem, as: "CartItem" }],
            transaction: sqlTransaction,
        })) as unknown as JoinReqUpdateCart;
        if (!cart2) {
            throw new Error("Invalid Cart Id");
        }

        for (const item of cart2.CartItem) {
            await addToCart(
                item.productNo,
                cartId1,
                item.quantity,
                item.thumbnailUrl as string
            );
        }

        // Fetch the updated cart. Format and return data to update store.
        const returnCartObj = await getCartById(cartId1);

        if (!returnCartObj) {
            throw new Error(
                "Unable to retrieve new cart state during cart merge"
            );
        }

        return {
            success: true,
            message: "Carts successfully merged",
            cart: returnCartObj,
        };
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            // Rollback the transaction in case of any errors
            throw new Error("Error merging carts: " + error.message);
        } else {
            // Rollback the transaction in case of any non-Error errors
            throw new Error("An unknown error occurred while merging carts");
        }
    }
};
