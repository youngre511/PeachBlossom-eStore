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
    getCatalogProductDetails,
} from "../controllers/productController.js";
import upload from "../middleware/uploadMiddleware.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorize.js";
import { passiveTokenVerification } from "../middleware/passiveTokenVerification.js";

productRouter.get("/", getProducts);

productRouter.get(
    "/admin",
    authMiddleware,
    authorizeRoles(["admin"]),
    getAdminProducts
);

productRouter.get("/search-options", getSearchOptions);

productRouter.post(
    "/create",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    upload.array("images", 10),
    createProduct
);

productRouter.put(
    "/update-details",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    upload.array("images", 10),
    updateProductDetails
);

productRouter.put(
    "/update-status",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    updateProductStatus
);

productRouter.delete(
    "/delete/:productNo",
    authMiddleware,
    authorizeRoles(["admin"], ["full"]),
    deleteProduct
);

productRouter.get("/:productNo", getOneProduct);

productRouter.get(
    "/catalog/:productNo",
    passiveTokenVerification,
    getCatalogProductDetails
);

export default productRouter;
