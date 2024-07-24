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

categoryRouter.get("/", getAllCategories);

categoryRouter.get("/name/:name", getCategoryByName);

categoryRouter.post("/create", createCategory);

categoryRouter.put("/update", updateCategoryName);

categoryRouter.put("/subcategory/update", updateSubcategoryName);

categoryRouter.delete("/delete/:name", deleteCategory);

categoryRouter.delete(
    "/subcategory/delete/:subcategoryName",
    deleteSubcategory
);

categoryRouter.post("/:categoryName/create-sub", createSubCategory);

export default categoryRouter;
