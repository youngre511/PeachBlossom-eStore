import { Router } from "express";
const inventoryRouter = Router();
import {
    adjustHoldQuantity,
    extendHold,
    holdStock,
    syncStockLevels,
    updateStockLevels,
} from "../controllers/inventoryController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorize.js";

inventoryRouter.put("/holdStock", holdStock);

inventoryRouter.put("/adjustHold", adjustHoldQuantity);

inventoryRouter.put("/extendHold", extendHold);

inventoryRouter.put(
    "/updateStockLevels",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    updateStockLevels
);

inventoryRouter.put("/syncStockLevels", syncStockLevels);

export default inventoryRouter;
