import { Request, RequestHandler, Response } from "express";
import * as userService from "../services/userService.js";

interface ChangeLevelRequest extends Request {
    body: {
        username: string;
        newAccessLevel: "full" | "limited" | "view only";
    };
}

interface UsernameParamsRequest extends Request {
    params: {
        username: string;
    };
}

export const getAdmins = async (req: Request, res: Response) => {
    try {
        const results = await userService.getAdmins();

        res.json({
            message: "success",
            payload: results,
        });
    } catch (error) {
        let errorObj = {
            message: "get admins failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const getCustomers = async (req: Request, res: Response) => {
    try {
        const results = await userService.getCustomers();

        res.json({
            message: "success",
            payload: results,
        });
    } catch (error) {
        let errorObj = {
            message: "get admins failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const changeAdminAccessLevel = async (
    req: ChangeLevelRequest,
    res: Response
) => {
    try {
        const { username, newAccessLevel } = req.body;
        const results = await userService.changeAdminAccessLevel(
            username,
            newAccessLevel
        );

        res.json({
            message: "success",
            payload: results,
        });
    } catch (error) {
        let errorObj = {
            message: "change admin access level failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};
export const deleteUser = async (req: UsernameParamsRequest, res: Response) => {
    try {
        const { username } = req.params;
        const accessLevel = req.user?.accessLevel;
        const results = await userService.deleteUser(username, accessLevel);

        res.json({
            message: "success",
            payload: results,
        });
    } catch (error) {
        let errorObj = {
            message: "delete user failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};
