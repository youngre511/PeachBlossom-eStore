import { Request, RequestHandler, Response } from "express";
import * as authService from "../services/authService.js";

interface CreateAccountRequest extends Request {
    body: {
        username: string;
        password: string;
        role: "customer" | "admin";
        accessLevel?: string;
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
        const token = await authService.createUser(
            username,
            password,
            role,
            accessLevel,
            email
        );

        res.status(201).json({ token });
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
        const token = await authService.login(username, password);

        res.json({ token });
    } catch (error) {
        let errorObj = {
            message: "login failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};
