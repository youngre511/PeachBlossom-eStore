import { Router } from "express";
import {
    adminLogin,
    createUser,
    login,
    refreshAccessToken,
    revokeRefreshToken,
} from "../controllers/authController.js";
import { validateRT } from "../middleware/validateRTMiddleware.js";
import { activityMiddleware } from "../middleware/activityMiddleware.js";

const router = Router();

router.post("/register", activityMiddleware, createUser);
router.post("/login", activityMiddleware, login);
router.post("/admin/login", adminLogin);
router.post("/refresh-access-token", validateRT, refreshAccessToken);
router.put("/revoke-refresh-token", validateRT, revokeRefreshToken);

export default router;
