import {
    placeOrder,
    getOneOrder,
    getOneCustomerOrder,
    getOrders,
    updateOrder,
    getCustomerOrders,
} from "../controllers/orderController.js";
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorize.js";
import { passiveTokenVerification } from "../middleware/passiveTokenVerification.js";
const orderRouter = Router();

orderRouter.get("/", passiveTokenVerification, getOrders);

orderRouter.get("/customerOrders", authMiddleware, getCustomerOrders);

orderRouter.get("/:orderNo", getOneOrder);

orderRouter.get("/customer/:orderNo", authMiddleware, getOneCustomerOrder);

orderRouter.post("/create", passiveTokenVerification, placeOrder);

orderRouter.put(
    "/update",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    updateOrder
);

export default orderRouter;
