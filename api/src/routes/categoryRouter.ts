import { Router } from "express";
const categoryRouter = Router();
import {
    getAllCategories,
    getCategoryByName,
    createCategory,
    createSubCategory,
    updateCategoryName,
    deleteCategory,
} from "../controllers/categoryController.js";

categoryRouter.get("/", getAllCategories);

categoryRouter.get("/name/:name", getCategoryByName);

categoryRouter.post("/create", createCategory);

categoryRouter.put("/update", updateCategoryName);

categoryRouter.delete("/delete/:name", deleteCategory);

categoryRouter.post("/:categoryName/create-sub", createSubCategory);

export default categoryRouter;
