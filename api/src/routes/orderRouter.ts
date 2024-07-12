import {
    placeOrder,
    getOneOrder,
    getOrders,
} from "../controllers/orderController.js";
import { Router } from "express";
const orderRouter = Router();

orderRouter.post("/create", placeOrder);

orderRouter.get("/", getOrders);

orderRouter.get("/:orderNo", getOneOrder);

export default orderRouter;
