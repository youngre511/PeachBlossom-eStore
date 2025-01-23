import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.js";
import { ReceivedUser } from "./authMiddleware.js";

export const activityMiddleware = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const trackingId = req.cookies.trackingId;
        const { allowAll } = JSON.parse(req.cookies.cookieConsent);

        if (trackingId && allowAll) {
            req.trackingId = trackingId;
        }

        const token = req.headers.authorization?.split(" ")[1];

        if (token && token !== "null") {
            const decoded = verifyToken(token) as ReceivedUser;
            if (
                typeof decoded === "object" &&
                "username" in decoded &&
                "role" in decoded
            ) {
                req.user = decoded;
            }
        }

        next();
    } catch (error) {
        res.status(401).json({
            message: "Error when extracting trackingId and user data",
        });
        return;
    }
};
