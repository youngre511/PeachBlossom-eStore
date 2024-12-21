import { Router } from "express";
import {
    changeAdminAccessLevel,
    changePassword,
    changeUsername,
    changeDisplayName,
    deleteUser,
    getAdmins,
    getCustomers,
    resetPassword,
} from "../controllers/userController.js";
import { authorizeRoles } from "../middleware/authorize.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get(
    "/admins",
    authMiddleware,
    authorizeRoles(["admin"], ["full"]),
    getAdmins
);
router.get(
    "/customers",
    authMiddleware,
    authorizeRoles(["admin"]),
    getCustomers
);

router.put(
    "/accessLevel",
    authMiddleware,
    authorizeRoles(["admin"], ["full"]),
    changeAdminAccessLevel
);

router.put(
    "/resetPassword",
    authMiddleware,
    authorizeRoles(["admin"], ["full"]),
    resetPassword
);

router.put("/changePassword", authMiddleware, changePassword);

router.put("/changeUsername", authMiddleware, changeUsername);

router.put("/changeDisplayName", authMiddleware, changeDisplayName);

router.delete(
    "/delete/:userId",
    authMiddleware,
    authorizeRoles(["admin"], ["full"]),
    deleteUser
);

export default router;
