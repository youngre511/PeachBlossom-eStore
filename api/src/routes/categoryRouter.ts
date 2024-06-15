const categoryRouter = require("express").Router();
const {
    getAllCategories,
    getCategoryByName,
    createCategory,
    createSubCategory,
    updateCategoryName,
    deleteCategory,
} = require("../controllers/categoryController");

categoryRouter.get("/", getAllCategories);

categoryRouter.get("/name/:name", getCategoryByName);

categoryRouter.post("/create", createCategory);

categoryRouter.put("/update", updateCategoryName);

categoryRouter.delete("/delete/:name", deleteCategory);

categoryRouter.post("/:categoryName/create-sub", createSubCategory);

module.exports = categoryRouter;
