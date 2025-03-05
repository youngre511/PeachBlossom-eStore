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
import { sanitize } from "../middleware/sanitizeMiddleware.js";
import {
    adminProductFilterSchema,
    createProductSchema,
    productFilterSchema,
    productNoParamSchema,
    updateProductSchema,
} from "../validator/productValidators.js";

productRouter.get("/", sanitize(productFilterSchema, "query"), getProducts);

productRouter.get(
    "/admin",
    authMiddleware,
    authorizeRoles(["admin"]),
    sanitize(adminProductFilterSchema, "query"),
    getAdminProducts
);

productRouter.get("/search-options", getSearchOptions);

productRouter.post(
    "/create",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    upload.array("images", 10),
    sanitize(createProductSchema, "body"),
    createProduct
);

productRouter.put(
    "/update-details",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    upload.array("images", 10),
    sanitize(updateProductSchema, "body"),
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

productRouter.get(
    "/:productNo",
    sanitize(productNoParamSchema, "params"),
    getOneProduct
);

productRouter.get(
    "/catalog/:productNo",
    passiveTokenVerification,
    sanitize(productNoParamSchema, "params"),
    getCatalogProductDetails
);

export default productRouter;
