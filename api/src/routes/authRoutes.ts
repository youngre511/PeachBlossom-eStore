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
import { createUserSchema, loginSchema } from "../validator/authValidators.js";
import { sanitize } from "../middleware/sanitizeMiddleware.js";

const router = Router();

router.post(
    "/register",
    activityMiddleware,
    sanitize(createUserSchema, "body"),
    createUser
);
router.post("/login", activityMiddleware, sanitize(loginSchema, "body"), login);
router.post("/admin/login", sanitize(loginSchema, "body"), adminLogin);
router.post("/refresh-access-token", validateRT, refreshAccessToken);
router.put("/revoke-refresh-token", validateRT, revokeRefreshToken);

export default router;
