import { Request, Response } from "express";
import * as activityService from "../services/activityService.js";
import { getIdFromUsername } from "../services/userService.js";
import { CookieRequest, LogRequest } from "./_controllerTypes.js";

export const verifyTrackingId = async (req: Request, res: Response) => {
    try {
        if (!req.trackingId) {
            const trackingId = await activityService.assignTrackingId(
                req.user ? req.user.username : undefined
            );

            res.cookie("trackingId", trackingId, {
                httpOnly: true,
                secure: true, //Only use secure in production mode, not local dev mode
                sameSite:
                    process.env.NODE_ENV === "development" ? "none" : "lax",
                path: "/",
                domain:
                    process.env.NODE_ENV !== "development"
                        ? ".pb.ryanyoung.codes"
                        : undefined,
                maxAge: 365 * 24 * 60 * 60 * 1000,
            });
        }

        res.status(200).json({ success: true });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({
                message:
                    "An unknown error occurred when refreshing access token.",
            });
        }
    }
};

export const assignTrackingId = async (req: Request, res: Response) => {
    try {
        const trackingId = await activityService.assignTrackingId(
            req.user ? req.user.username : undefined
        );

        res.cookie("trackingId", trackingId, {
            httpOnly: true,
            secure: true, //Only use secure in production mode, not local dev mode
            sameSite: process.env.NODE_ENV === "development" ? "none" : "lax",
            path: "/",
            domain:
                process.env.NODE_ENV !== "development"
                    ? ".pb.ryanyoung.codes"
                    : undefined,
            maxAge: 365 * 24 * 60 * 60 * 1000,
        });

        res.status(200).json();
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({
                message:
                    "An unknown error occurred when assigning tracking Id.",
            });
        }
    }
};

export const deleteActivityTracker = async (req: Request, res: Response) => {
    try {
        res.cookie("trackingId", "", {
            httpOnly: true,
            secure: true, //Only use secure in production mode, not local dev mode
            sameSite: process.env.NODE_ENV === "development" ? "none" : "lax",
            path: "/",
            domain:
                process.env.NODE_ENV !== "development"
                    ? ".pb.ryanyoung.codes"
                    : undefined,

            expires: new Date(0),
        });

        res.status(200).json();
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({
                message:
                    "An unknown error occurred when deleting activity tracker.",
            });
        }
    }
};

export const logActivity = async (req: LogRequest, res: Response) => {
    try {
        if (!req.trackingId) {
            console.error(
                "No trackingId included in request. Unable to log activity"
            );
            res.status(400).json({
                message: "No identifier included. Unable to log activity.",
            });
            return;
        }
        let userId;
        if (req.user) {
            userId = await getIdFromUsername(req.user.username);
        }

        const result = await activityService.logActivity(
            req.body.logs,
            req.trackingId as string,
            userId ? userId : undefined
        );

        res.status(200).json({ message: `${result} logs successfully added.` });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({
                message:
                    "An unknown error occurred when deleting activity tracker.",
            });
        }
    }
};

export const setCookieConsent = async (req: CookieRequest, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User token required" });
            return;
        }
        const { allowAll } = req.body;
        const result = await activityService.setCookieConsent(
            req.user.username,
            allowAll
        );

        res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({
                message:
                    "An unknown error occurred when setting cookie consent.",
            });
        }
    }
};

export const retrieveCookieConsent = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            res.status(401).json({ message: "User token required" });
            return;
        }

        const result = await activityService.retrieveCookieConsent(
            req.user.username
        );

        res.status(200).json(result);
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({
                message:
                    "An unknown error occurred when retrieving cookie consent data.",
            });
        }
    }
};
