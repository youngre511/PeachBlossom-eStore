import { Request, Response, NextFunction } from "express";

export const authorizeRoles = (roles: string[], accessLevels?: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res
                .status(403)
                .json({ message: "Access denied, insufficient permissions." });
        }

        if (req.user.role === "admin" && !req.user.accessLevel) {
            return res
                .status(403)
                .json({ message: "Access denied, unspecified access level." });
        }

        if (req.user.role === "admin" && req.user.accessLevel) {
            if (accessLevels && !accessLevels.includes(req.user.accessLevel)) {
                return res.status(403).json({
                    message: "Access denied,  insufficient access level.",
                });
            }
        }

        next();
    };
};
