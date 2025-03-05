import {
    getAverageOrderValue,
    getItemsPerTransaction,
    getRegionRevenuePercentages,
    getRevenueByCategory,
    getRevenueOverTime,
    getTopProducts,
    getTransactionsOverTime,
} from "../controllers/analyticsController.js";
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
const analyticsRouter = Router();

analyticsRouter.get("/rot", authMiddleware, getRevenueOverTime);

analyticsRouter.get("/rbc", authMiddleware, getRevenueByCategory);

analyticsRouter.get("/tot", authMiddleware, getTransactionsOverTime);

analyticsRouter.get("/ipt", authMiddleware, getItemsPerTransaction);

analyticsRouter.get("/aov", authMiddleware, getAverageOrderValue);

analyticsRouter.get("/rrp", authMiddleware, getRegionRevenuePercentages);

analyticsRouter.get("/tfp", authMiddleware, getTopProducts);

export default analyticsRouter;
