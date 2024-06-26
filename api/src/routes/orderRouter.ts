import { placeOrder } from "../controllers/orderController.js";
import { Router } from "express";
const orderRouter = Router();

orderRouter.post("/create", placeOrder);

export default orderRouter;
