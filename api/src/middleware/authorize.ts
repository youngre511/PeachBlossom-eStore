import { Request, Response, NextFunction } from "express";

export const authorizeRoles = (roles: string[], accessLevels?: string[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user || !roles.includes(req.user.role)) {
            res.status(403).json({
                message: "Access denied, insufficient permissions.",
            });
            return;
        }

        if (req.user.role === "admin" && !req.user.accessLevel) {
            res.status(403).json({
                message: "Access denied, unspecified access level.",
            });
            return;
        }

        if (req.user.role === "admin" && req.user.accessLevel) {
            if (accessLevels && !accessLevels.includes(req.user.accessLevel)) {
                res.status(403).json({
                    message: "Access denied,  insufficient access level.",
                });
                return;
            }
        }

        next();
    };
};
