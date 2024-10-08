import { Router } from "express";
const cartRouter = Router();
import {
    getCartById,
    getCustomerCart,
    addToCart,
    deleteFromCart,
    updateItemQuantity,
    mergeCarts,
} from "../controllers/cartController.js";

function dummyFunc() {}

cartRouter.get("/cartId/:cartId", getCartById);

cartRouter.get("/customerId/:customerId", getCustomerCart);

cartRouter.put("/add-to-cart", addToCart);

cartRouter.put("/update-quantity", updateItemQuantity);

cartRouter.put("/delete-from-cart", deleteFromCart);

cartRouter.put("/merge-carts", mergeCarts);

export default cartRouter;
