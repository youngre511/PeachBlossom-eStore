import { Router } from "express";
const categoryRouter = Router();
import {
    getAllCategories,
    getCategoryByName,
    createCategory,
    createSubcategory,
    updateCategoryName,
    updateSubcategoryName,
    deleteCategory,
    deleteSubcategory,
} from "../controllers/categoryController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorize.js";
import {
    categoryNameSchema,
    categoryNameUpdateSchema,
    subcategoryNameSchema,
} from "../validator/categoryValidators.js";
import { sanitize } from "../middleware/sanitizeMiddleware.js";

categoryRouter.get("/", getAllCategories);

categoryRouter.get(
    "/name/:name",
    sanitize(categoryNameSchema, "params"),
    getCategoryByName
);

categoryRouter.post(
    "/create",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    sanitize(categoryNameSchema, "body"),
    createCategory
);

categoryRouter.put(
    "/update",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    sanitize(categoryNameUpdateSchema, "body"),
    updateCategoryName
);

categoryRouter.put(
    "/subcategory/update",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    sanitize(categoryNameUpdateSchema, "body"),
    updateSubcategoryName
);

categoryRouter.delete(
    "/delete/:name",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    sanitize(categoryNameSchema, "params"),
    deleteCategory
);

categoryRouter.delete(
    "/subcategory/delete/:subcategoryName",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    sanitize(subcategoryNameSchema, "params"),
    deleteSubcategory
);

categoryRouter.post(
    "/:categoryName/create-sub",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    sanitize(categoryNameSchema, "params"),
    sanitize(subcategoryNameSchema, "body"),
    createSubcategory
);

export default categoryRouter;
