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
) => {
    const token = req.headers.authorization?.split(" ")[1];
    console.log("token:", token);
    if (!token) {
        return res
            .status(401)
            .json({ message: "Access denied, no token provided." });
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
