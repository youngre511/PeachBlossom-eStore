import { Router } from "express";
const productRouter = Router();
import {
    getProducts,
    getOneProduct,
    getSearchOptions,
    getProductsInPromotion,
    createProduct,
    deleteProduct,
    updateProductDetails,
    updateProductStatus,
    getAdminProducts,
} from "../controllers/productController.js";
import upload from "../middleware/uploadMiddleware.js";

productRouter.get("/", getProducts);

productRouter.get("/admin", getAdminProducts);

productRouter.get("/search-options", getSearchOptions);

productRouter.post("/create", upload.array("images", 10), createProduct);

productRouter.put("/update-details", updateProductDetails);

productRouter.put("/update-status", updateProductStatus);

productRouter.delete("/delete/:productNo", deleteProduct);

productRouter.get("/:productNo", getOneProduct);

export default productRouter;
