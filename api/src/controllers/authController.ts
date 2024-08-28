import { Request, RequestHandler, Response } from "express";
import * as authService from "../services/authService.js";

interface CreateAccountRequest extends Request {
    body: {
        username: string;
        password: string;
        role: "customer" | "admin";
        accessLevel?: "full" | "limited";
        email?: string;
    };
}

interface LoginRequest extends Request {
    body: {
        username: string;
        password: string;
    };
}

export const createUser = async (req: CreateAccountRequest, res: Response) => {
    try {
        const {
            username,
            password,
            role,
            accessLevel = null,
            email = null,
        } = req.body;
        const { accessToken, refreshToken } = await authService.createUser(
            username,
            password,
            role,
            accessLevel,
            email
        );
        // Store refresh token in http-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true, //Only use secure in production mode, not local dev mode
            sameSite: "none",
            path: "/",
            domain: ".pb.ryanyoung.codes",
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
        });
        res.status(201).json({ accessToken });
    } catch (error) {
        let errorObj = {
            message: "create user failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const login = async (req: LoginRequest, res: Response) => {
    try {
        const { username, password } = req.body;
        const { accessToken, refreshToken } = await authService.login(
            username,
            password
        );
        // Store refresh token in http-only cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: true, //Only use secure in production mode, not local dev mode
            sameSite: "none",
            path: "/",
            domain: ".pb.ryanyoung.codes",
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
        });

        res.json({ accessToken });
    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "Invalid username or password.") {
                res.status(401).json({
                    message: `Error logging in: ${error.message}`,
                });
            } else {
                res.status(500).json({ message: error.message });
            }
        } else {
            res.status(500).json({
                message: "An unknown error occurred when logging in.",
            });
        }
    }
};

export const refreshAccessToken = async (req: Request, res: Response) => {
    try {
        if (!req.refreshToken) {
            throw new Error("No refresh token provided by middleware");
        }
        const { jti, user_id } = req.refreshToken;

        const { newAccessToken, newRefreshToken } =
            await authService.refreshAccessToken(user_id, jti);

        res.cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: true, //Only use secure in production mode, not local dev mode
            sameSite: "none",
            path: "/",
            domain: ".pb.ryanyoung.codes",
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
        });
        res.json({ newAccessToken });
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

export const revokeRefreshToken = async (req: Request, res: Response) => {
    try {
        if (!req.refreshToken) {
            throw new Error("No refresh token provided by middleware");
        }
        const { jti } = req.refreshToken;

        await authService.revokeRefreshToken(jti);

        res.cookie("refreshToken", "", {
            httpOnly: true,
            secure: true, //Only use secure in production mode, not local dev mode
            sameSite: "none",
            path: "/",
            domain: ".pb.ryanyoung.codes",
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
        });
        res.json({ success: true });
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({
                message:
                    "An unknown error occurred when revoking refresh token.",
            });
        }
    }
};
