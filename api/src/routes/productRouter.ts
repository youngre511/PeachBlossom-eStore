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
    updateProductPrice,
    updateProductStock,
} from "../controllers/productController";

productRouter.get("/", getProducts);

productRouter.get("/search-options", getSearchOptions);

productRouter.post("/create", createProduct);

productRouter.put("/update-details/:productNo", updateProductDetails);

productRouter.put("/update-price/:productNo", updateProductPrice);

productRouter.put("/update-stock/:productNo", updateProductStock);

productRouter.delete("/delete/:productNo", deleteProduct);

productRouter.get("/:productNo", getOneProduct);

export default productRouter;
