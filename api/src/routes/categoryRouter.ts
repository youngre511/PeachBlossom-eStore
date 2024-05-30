const categoryRouter = require("express").Router();
const {
    getAllCategories,
    getCategoryById,
    getCategoryByName,
    createCategory,
    updateCategoryName,
    deleteCategory,
} = require("../controllers/categoryController");

categoryRouter.get("/", getAllCategories);

categoryRouter.get("/id/:id", getCategoryById);

categoryRouter.get("/name/:name", getCategoryByName);

categoryRouter.post("/create", createCategory);

categoryRouter.put("/update", updateCategoryName);

categoryRouter.delete("/delete/:name", deleteCategory);

module.exports = categoryRouter;
