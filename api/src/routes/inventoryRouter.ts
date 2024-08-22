import { Router } from "express";
const inventoryRouter = Router();
import {
    holdStock,
    releaseStock,
    syncStockLevels,
    updateStockLevels,
} from "../controllers/inventoryController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/authorize.js";

inventoryRouter.put("/holdStock", holdStock);

inventoryRouter.put("/releaseStock", releaseStock);

inventoryRouter.put(
    "/updateStockLevels",
    authMiddleware,
    authorizeRoles(["admin"], ["full", "limited"]),
    updateStockLevels
);

inventoryRouter.post("/syncStockLevels", syncStockLevels);

export default inventoryRouter;
