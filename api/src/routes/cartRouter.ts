import { Router } from "express";
const cartRouter = Router();
import {
    getCartById,
    getCustomerCart,
    addToCart,
    deleteFromCart,
    updateItemQuantity,
} from "../controllers/cartController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { passiveTokenVerification } from "../middleware/passiveTokenVerification.js";
import { quantitySchema } from "../validator/commonSchemas.js";
import { sanitize } from "../middleware/sanitizeMiddleware.js";

cartRouter.get("/cartId/:cartId", getCartById);

cartRouter.get("/customer/", authMiddleware, getCustomerCart);

cartRouter.put(
    "/add-to-cart",
    passiveTokenVerification,
    sanitize(quantitySchema, "body"),
    addToCart
);

cartRouter.put(
    "/update-quantity",
    sanitize(quantitySchema, "body"),
    updateItemQuantity
);

cartRouter.put("/delete-from-cart", deleteFromCart);

export default cartRouter;
