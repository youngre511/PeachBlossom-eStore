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

function dummyFunc() {}

cartRouter.get("/cartId/:cartId", getCartById);

cartRouter.get("/customerId/:customerId", getCustomerCart);

cartRouter.put("/add-to-cart", addToCart);

cartRouter.put("/update-quantity", updateItemQuantity);

cartRouter.put("/delete-from-cart", deleteFromCart);

export default cartRouter;
