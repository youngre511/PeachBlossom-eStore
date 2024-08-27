import { Router } from "express";
import {
    createUser,
    login,
    refreshAccessToken,
    revokeRefreshToken,
} from "../controllers/authController.js";
import { validateRT } from "../middleware/validateRTMiddleware.js";

const router = Router();

router.post("/register", createUser);
router.post("/login", login);
router.post("/refresh-access-token", validateRT, refreshAccessToken);
router.put("/revoke-refresh-token", validateRT, revokeRefreshToken);

export default router;
