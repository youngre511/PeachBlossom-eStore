import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
        return res
            .status(401)
            .json({ message: "Access denied, no token provided." });
    }

    try {
        const decoded = verifyToken(token);
        if (
            typeof decoded === "object" &&
            "user_id" in decoded &&
            "role" in decoded
        ) {
            req.user = decoded;
            next();
        } else {
            throw new Error("Invalid token structure");
        }
    } catch (err) {
        res.status(401).json({ message: "Invalid token." });
    }
};