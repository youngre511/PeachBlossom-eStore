import { Router } from "express";
const promotionRouter = Router();

import {
    getAllPromotions,
    getOnePromotion,
    createPromotion,
    addToPromotion,
    updatePromotion,
    removeFromPromotion,
    deletePromotion,
} from "../controllers/promotionController";

promotionRouter.get("/", getAllPromotions);

promotionRouter.get("/:promoId", getOnePromotion);

promotionRouter.post("/create", createPromotion);

promotionRouter.put("/update", updatePromotion);

promotionRouter.put("/add/:promoId", addToPromotion);

promotionRouter.put("/remove/:promoId", removeFromPromotion);

promotionRouter.delete("/delete/:promoId", deletePromotion);

export default promotionRouter;
