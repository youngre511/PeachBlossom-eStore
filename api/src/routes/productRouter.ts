const productRouter = require("express").Router();
const {
    getAllProducts,
    getOneProduct,
    getProductsByCategory,
    getProductsInPromotion,
    createProduct,
    deleteProduct,
    updateProductDetails,
    updateProductPrice,
    updateProductStock,
} = require("../controllers/productController");

productRouter.get("/", getAllProducts);

productRouter.get("/category/:categoryName", getProductsByCategory);

productRouter.get("/promotion/:promoId", getProductsInPromotion);

productRouter.get("/:productNo", getOneProduct);

productRouter.post("/create", createProduct);

productRouter.put("/update-details/:productNo", updateProductDetails);

productRouter.put("/update-price/:productNo", updateProductPrice);

productRouter.put("/update-stock/:productNo", updateProductStock);

productRouter.delete("/delete/:productNo", deleteProduct);
