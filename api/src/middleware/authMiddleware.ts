import { Request, Response, NextFunction } from "express";
import { UserPayload, verifyToken } from "../utils/jwt.js";

export interface ReceivedUser extends UserPayload {
    iat?: number;
    exp?: number;
}

export const authMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        res.status(401).json({ message: "Access denied, no token provided." });
        return;
    }
    console.log("token:", token);
    try {
        const decoded = verifyToken(token) as ReceivedUser;
        if (
            typeof decoded === "object" &&
            "username" in decoded &&
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
