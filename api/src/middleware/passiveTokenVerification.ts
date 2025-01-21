import { Request, Response, NextFunction } from "express";
import { UserPayload, verifyToken } from "../utils/jwt.js";

export interface ReceivedUser extends UserPayload {
    iat?: number;
    exp?: number;
}

export const passiveTokenVerification = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token || token === "null") {
        next();
        return;
    }

    try {
        const decoded = verifyToken(token) as ReceivedUser;
        if (
            typeof decoded === "object" &&
            "username" in decoded &&
            "role" in decoded
        ) {
            req.user = decoded;
        } else {
            console.error("Invalid token structure");
        }
        next();
    } catch (err) {
        console.error("Invalid token");
        next();
    }
};
