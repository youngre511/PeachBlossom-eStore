import { Router } from "express";
import {
    changeAdminAccessLevel,
    deleteUser,
    getAdmins,
    getCustomers,
} from "../controllers/userController.js";
import { authorizeRoles } from "../middleware/authorize.js";
import { authMiddleware } from "../middleware/authMiddlware.js";

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

router.delete(
    "/delete/:username",
    authMiddleware,
    authorizeRoles(["admin"], ["full"]),
    deleteUser
);

export default router;
