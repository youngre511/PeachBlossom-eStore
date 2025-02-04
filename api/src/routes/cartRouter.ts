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

cartRouter.get("/cartId/:cartId", getCartById);

cartRouter.get("/customer/", authMiddleware, getCustomerCart);

cartRouter.put("/add-to-cart", passiveTokenVerification, addToCart);

cartRouter.put("/update-quantity", updateItemQuantity);

cartRouter.put("/delete-from-cart", deleteFromCart);

export default cartRouter;
