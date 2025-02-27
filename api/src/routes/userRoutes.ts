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
    getCustomerAddresses,
    removeCustomerAddress,
    addCustomerAddress,
    editCustomerAddress,
    closeAccount,
    syncRecentlyViewed,
} from "../controllers/userController.js";
import { authorizeRoles } from "../middleware/authorize.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { sanitize } from "../middleware/sanitizeMiddleware.js";
import {
    addAddressSchema,
    changeDisplayNameSchema,
    changeLevelSchema,
    changeUsernameSchema,
    editAddressSchema,
    getUsersSchema,
} from "../validator/userValidators.js";

const router = Router();

router.get(
    "/admins",
    authMiddleware,
    authorizeRoles(["admin"], ["full"]),
    sanitize(getUsersSchema, "query"),
    getAdmins
);
router.get(
    "/customers",
    authMiddleware,
    authorizeRoles(["admin"]),
    sanitize(getUsersSchema, "query"),
    getCustomers
);

router.get("/customer/addresses", authMiddleware, getCustomerAddresses);

router.put(
    "/accessLevel",
    authMiddleware,
    authorizeRoles(["admin"], ["full"]),
    sanitize(changeLevelSchema, "body"),
    changeAdminAccessLevel
);

router.put(
    "/resetPassword",
    authMiddleware,
    authorizeRoles(["admin"], ["full"]),
    resetPassword
);

router.put("/changePassword", authMiddleware, changePassword);

router.put(
    "/changeUsername",
    authMiddleware,
    sanitize(changeUsernameSchema, "body"),
    changeUsername
);

router.put(
    "/changeDisplayName",
    authMiddleware,
    sanitize(changeDisplayNameSchema, "body"),
    changeDisplayName
);

router.put("/customer/removeAddress", authMiddleware, removeCustomerAddress);

router.put(
    "/customer/editAddress",
    authMiddleware,
    sanitize(editAddressSchema, "body"),
    editCustomerAddress
);

router.put("/syncRecent", authMiddleware, syncRecentlyViewed);

router.post(
    "/customer/addAddress",
    authMiddleware,
    sanitize(addAddressSchema, "body"),
    addCustomerAddress
);

router.delete("customer/delete", authMiddleware, closeAccount);

router.delete(
    "/delete/:userId",
    authMiddleware,
    authorizeRoles(["admin"], ["full"]),
    deleteUser
);

export default router;
