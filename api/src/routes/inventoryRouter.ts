import { Router } from "express";
const inventoryRouter = Router();
import {
    holdStock,
    releaseStock,
    updateStockLevels,
} from "../controllers/inventoryController.js";

inventoryRouter.put("/holdStock", holdStock);

inventoryRouter.put("/releaseStock", releaseStock);

inventoryRouter.put("/updateStockLevels", updateStockLevels);

export default inventoryRouter;
