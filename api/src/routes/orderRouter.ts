import {
    placeOrder,
    getOneOrder,
    getOrders,
    updateOrder,
} from "../controllers/orderController.js";
import { Router } from "express";
const orderRouter = Router();

orderRouter.get("/", getOrders);

orderRouter.get("/:orderNo", getOneOrder);

orderRouter.post("/create", placeOrder);

orderRouter.put("/update", updateOrder);

export default orderRouter;
