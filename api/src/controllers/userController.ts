import { Request, RequestHandler, Response } from "express";
import * as userService from "../services/userService.js";

interface ChangeLevelRequest extends Request {
    body: {
        username: string;
        newAccessLevel: "full" | "limited" | "view only";
    };
}

interface ResetPasswordRequest extends Request {
    body: {
        user_id: number;
    };
}

interface UserIdParamsRequest extends Request {
    params: {
        userId: string;
    };
}

interface GetRequest extends Request {
    query: {
        page: string;
        usersPerPage: string;
        accessLevel?: string;
        searchString?: string;
    };
}

export const getAdmins = async (req: GetRequest, res: Response) => {
    try {
        const { searchString, accessLevel, page, usersPerPage } = req.query;
        if (!accessLevel) {
            throw new Error("Request missing accessLevel parameter");
        }
        const accessLevelArray = accessLevel.split(",");
        const results = await userService.getAdmins(
            +page,
            +usersPerPage,
            accessLevelArray as Array<"full" | "limited" | "view only">,
            searchString
        );
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

export const getCustomers = async (req: GetRequest, res: Response) => {
    try {
        const { searchString, page, usersPerPage } = req.query;
        const results = await userService.getCustomers(
            +page,
            +usersPerPage,
            searchString
        );

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

export const resetPassword = async (
    req: ResetPasswordRequest,
    res: Response
) => {
    try {
        const { user_id } = req.body;
        const results = await userService.resetPassword(user_id);

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

export const deleteUser = async (req: UserIdParamsRequest, res: Response) => {
    try {
        const { userId } = req.params;
        const accessLevel = req.user?.accessLevel;
        const results = await userService.deleteUser(userId, accessLevel);

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
