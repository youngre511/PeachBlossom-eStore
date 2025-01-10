import { Request, Response, NextFunction } from "express";
import { verifyRefreshToken } from "../utils/jwt.js";
import { sqlRefreshToken } from "../models/mysql/sqlRefreshTokenModel.js";

export const validateRT = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        res.status(401).json({
            message: "Operation denied, no refresh token provided.",
        });
        return;
    }

    try {
        const decoded = verifyRefreshToken(refreshToken);
        if (
            typeof decoded === "object" &&
            "user_id" in decoded &&
            "iat" in decoded &&
            "jti" in decoded
        ) {
            const tokenRecord = await sqlRefreshToken.findOne({
                where: { jti: decoded.jti, revoked: false },
            });
            if (
                !tokenRecord ||
                tokenRecord.token !== refreshToken ||
                tokenRecord.expires_at < new Date()
            ) {
                res.status(401).json({
                    message:
                        "Operation denied, invalid or expired refresh token.",
                });
                return;
            }
            req.refreshToken = decoded;
            console.log("token validated");
            next();
        } else {
            res.status(401).json({ message: "Invalid refreshToken structure" });
            return;
        }
    } catch (error) {
        res.status(401).json({ message: "Invalid refreshToken" });
        return;
    }
};
