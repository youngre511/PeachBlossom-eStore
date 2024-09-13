import {
    getAverageOrderValue,
    getItemsPerTransaction,
    getRegionRevenuePercentages,
    getRevenueByCategory,
    getRevenueOverTime,
    getTopFiveProducts,
    getTransactionsOverTime,
} from "../controllers/analyticsController.js";
import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorize.js";
const analyticsRouter = Router();

analyticsRouter.get("/rot", getRevenueOverTime);

analyticsRouter.get("/rbc", getRevenueByCategory);

analyticsRouter.get("/tot", getTransactionsOverTime);

analyticsRouter.get("/ipt", getItemsPerTransaction);

analyticsRouter.get("/aov", getAverageOrderValue);

analyticsRouter.get("/rrp", getRegionRevenuePercentages);

analyticsRouter.get("/tfp", getTopFiveProducts);

export default analyticsRouter;
