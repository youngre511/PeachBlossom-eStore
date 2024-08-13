import { Router } from "express";
const categoryRouter = Router();
import {
    getAllCategories,
    getCategoryByName,
    createCategory,
    createSubCategory,
    updateCategoryName,
    updateSubcategoryName,
    deleteCategory,
    deleteSubcategory,
} from "../controllers/categoryController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorize.js";

categoryRouter.get("/", getAllCategories);

categoryRouter.get("/name/:name", getCategoryByName);

categoryRouter.post(
    "/create",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    createCategory
);

categoryRouter.put(
    "/update",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    updateCategoryName
);

categoryRouter.put(
    "/subcategory/update",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    updateSubcategoryName
);

categoryRouter.delete(
    "/delete/:name",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    deleteCategory
);

categoryRouter.delete(
    "/subcategory/delete/:subcategoryName",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    deleteSubcategory
);

categoryRouter.post(
    "/:categoryName/create-sub",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    createSubCategory
);

export default categoryRouter;
