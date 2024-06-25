import { Router } from "express";
const inventoryRouter = Router();
import { holdStock, releaseStock } from "../controllers/inventoryController";

inventoryRouter.put("/holdStock", holdStock);

inventoryRouter.put("/releaseStock", releaseStock);

export default inventoryRouter;
