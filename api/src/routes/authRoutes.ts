import { Router } from "express";
import { createUser, login } from "../controllers/authController.js";

const router = Router();

router.post("/register", createUser);
router.post("/login", login);

export default router;
