import { Router } from "express";
import {
    assignTrackingId,
    deleteActivityTracker,
    logActivity,
    verifyTrackingId,
} from "../controllers/activityController.js";
import { activityMiddleware } from "../middleware/activityMiddleware.js";

const activityRouter = Router();

activityRouter.get("/assign", activityMiddleware, assignTrackingId);
activityRouter.get("/verify", activityMiddleware, verifyTrackingId);
activityRouter.get("/deleteId", deleteActivityTracker);
activityRouter.post("/addLogs", activityMiddleware, logActivity);

export default activityRouter;
