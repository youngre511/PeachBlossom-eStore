import {
    placeOrder,
    getOneOrder,
    getOrders,
    updateOrder,
} from "../controllers/orderController.js";
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddlware.js";
import { authorizeRoles } from "../middleware/authorize.js";
const orderRouter = Router();

orderRouter.get("/", getOrders);

orderRouter.get("/:orderNo", getOneOrder);

orderRouter.post("/create", placeOrder);

orderRouter.put(
    "/update",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    updateOrder
);

export default orderRouter;
