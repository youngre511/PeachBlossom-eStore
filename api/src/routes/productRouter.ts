const productRouter = require("express").Router();
const {
    getProducts,
    getOneProduct,
    getSearchOptions,
    getProductsInPromotion,
    createProduct,
    deleteProduct,
    updateProductDetails,
    updateProductPrice,
    updateProductStock,
} = require("../controllers/productController");

productRouter.get("/", getProducts);

productRouter.get("/search-options", getSearchOptions);

productRouter.post("/create", createProduct);

productRouter.put("/update-details/:productNo", updateProductDetails);

productRouter.put("/update-price/:productNo", updateProductPrice);

productRouter.put("/update-stock/:productNo", updateProductStock);

productRouter.delete("/delete/:productNo", deleteProduct);

productRouter.get("/:productNo", getOneProduct);

module.exports = productRouter;
