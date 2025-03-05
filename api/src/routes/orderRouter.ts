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
import {
    orderNoSchema,
    ordersFilterSchema,
    placeOrderSchema,
    updateOrderDataSchema,
} from "../validator/orderValidators.js";
import { sanitize } from "../middleware/sanitizeMiddleware.js";
import { emailOptionalSchema } from "../validator/commonSchemas.js";
const orderRouter = Router();

orderRouter.get(
    "/",
    passiveTokenVerification,
    sanitize(ordersFilterSchema, "query"),
    getOrders
);

orderRouter.get(
    "/customerOrders",
    authMiddleware,
    sanitize(ordersFilterSchema, "query"),
    getCustomerOrders
);

orderRouter.get("/:orderNo", sanitize(orderNoSchema, "params"), getOneOrder);

orderRouter.get(
    "/customer/:orderNo",
    authMiddleware,
    sanitize(orderNoSchema, "params"),
    sanitize(emailOptionalSchema, "query"),
    getOneCustomerOrder
);

orderRouter.post(
    "/create",
    passiveTokenVerification,
    sanitize(placeOrderSchema, "body"),
    placeOrder
);

orderRouter.put(
    "/update",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    sanitize(updateOrderDataSchema, "body"),
    updateOrder
);

export default orderRouter;
