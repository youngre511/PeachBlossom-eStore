import {
    getItemsPerTransaction,
    getRevenueByCategory,
    getRevenueOverTime,
    getTransactionStats,
} from "../controllers/analyticsController.js";
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorize.js";
const analyticsRouter = Router();

analyticsRouter.get("/rot", getRevenueOverTime);

analyticsRouter.get("/rbc", getRevenueByCategory);

analyticsRouter.get("/tot", getTransactionStats);

analyticsRouter.get("/ipt", getItemsPerTransaction);

export default analyticsRouter;
