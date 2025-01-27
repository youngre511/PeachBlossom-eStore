import { Router } from "express";
import {
    assignTrackingId,
    deleteActivityTracker,
    logActivity,
    retrieveCookieConsent,
    setCookieConsent,
    verifyTrackingId,
} from "../controllers/activityController.js";
import { activityMiddleware } from "../middleware/activityMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const activityRouter = Router();

activityRouter.get("/assign", activityMiddleware, assignTrackingId);
activityRouter.get("/verify", activityMiddleware, verifyTrackingId);
activityRouter.get("/cookieConsent", authMiddleware, retrieveCookieConsent);

activityRouter.post("/addLogs", activityMiddleware, logActivity);

activityRouter.put("/setCookieConsent", authMiddleware, setCookieConsent);

activityRouter.delete("/deleteId", deleteActivityTracker);

export default activityRouter;
