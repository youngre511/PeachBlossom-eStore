import { Request, Response } from "express";
import * as userService from "../services/userService.js";
import {
    AddCustomerAddressRequest,
    ChangeDisplayNameRequest,
    ChangeLevelRequest,
    ChangePasswordRequest,
    ChangeUsernameRequest,
    CloseAccountRequest,
    EditCustomerAddressRequest,
    GetRequest,
    RemoveCustomerAddressRequest,
    ResetPasswordRequest,
    SyncReviewedRequest,
    UserIdParamsRequest,
} from "./_controllerTypes.js";

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

export const changePassword = async (
    req: ChangePasswordRequest,
    res: Response
) => {
    try {
        const { oldPassword, newPassword } = req.body;
        if (!req.user) {
            throw new Error("No user token");
        }

        const accessToken = await userService.changePassword(
            req.user,
            oldPassword,
            newPassword
        );

        if (!accessToken) {
            res.status(403).json({ message: "Invalid password." });
        }

        res.json({
            accessToken,
        });
    } catch (error) {
        let errorObj = {
            message: "change password failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const changeUsername = async (
    req: ChangeUsernameRequest,
    res: Response
) => {
    try {
        const { newUsername, password } = req.body;
        if (!req.user) {
            throw new Error("No user token");
        }

        const accessToken = await userService.changeUsername(
            req.user,
            newUsername,
            password
        );

        if (!accessToken) {
            res.status(403).json({ message: "Invalid password." });
        }

        res.json({
            accessToken,
        });
    } catch (error) {
        let errorObj = {
            message: "change username failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const changeDisplayName = async (
    req: ChangeDisplayNameRequest,
    res: Response
) => {
    try {
        const { newFirstName, newLastName, password } = req.body;
        if (!req.user) {
            throw new Error("No user token");
        }

        const accessToken = await userService.changeDisplayName(
            req.user,
            newFirstName,
            newLastName,
            password
        );

        if (!accessToken) {
            res.status(403).json({ message: "Invalid password." });
        }

        res.json({
            accessToken,
        });
    } catch (error) {
        let errorObj = {
            message: "change display name failure",
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
        const results = await userService.deleteUser({ userId, accessLevel });

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

export const closeAccount = async (req: CloseAccountRequest, res: Response) => {
    try {
        if (!req.user) {
            throw new Error("No user token provided");
        }
        const { username, role } = req.user;

        const { password } = req.body;

        if (role !== "customer") {
            throw new Error(
                "closeAccount api endpoint can only be used with customer accounts"
            );
        }
        const results = await userService.deleteUser({ username, password });

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

export const getCustomerAddresses = async (req: Request, res: Response) => {
    try {
        if (!req.user) {
            throw new Error("No user token");
        }

        const customer_id = await userService.getCustomerIdFromUsername(
            req.user.username
        );

        if (!customer_id) {
            throw new Error("No customer_id in token");
        }

        const results = await userService.getCustomerAddresses(+customer_id);

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

export const addCustomerAddress = async (
    req: AddCustomerAddressRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            throw new Error("No user token");
        }

        const customer_id = userService.getCustomerIdFromUsername(
            req.user.username
        );

        if (!customer_id) {
            throw new Error("No customer_id in token");
        }

        const { address, nickname } = req.body;

        const results = await userService.addCustomerAddress(
            +customer_id,
            address,
            nickname
        );

        res.json({
            message: "success",
            payload: results,
        });
    } catch (error) {
        let errorObj = {
            message: "add customer address failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const removeCustomerAddress = async (
    req: RemoveCustomerAddressRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            throw new Error("No user token");
        }

        const customer_id = await userService.getCustomerIdFromUsername(
            req.user.username
        );

        if (!customer_id) {
            throw new Error("No customer_id in token");
        }

        const { addressId } = req.body;

        const results = await userService.removeCustomerAddress(
            +customer_id,
            addressId
        );

        res.json({
            message: "success",
            payload: results,
        });
    } catch (error) {
        let errorObj = {
            message: "remove customer address failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const editCustomerAddress = async (
    req: EditCustomerAddressRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            throw new Error("No user token");
        }

        const customer_id = await userService.getCustomerIdFromUsername(
            req.user.username
        );

        if (!customer_id) {
            throw new Error("No customer_id in token");
        }

        const { addressId, address, nickname } = req.body;

        const results = await userService.editCustomerAddress(
            +customer_id,
            addressId,
            address,
            nickname
        );

        res.json({
            message: "success",
            payload: results,
        });
    } catch (error) {
        let errorObj = {
            message: "edit customer address failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};

export const syncRecentlyViewed = async (
    req: SyncReviewedRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            throw new Error("No user token");
        }

        const customerId = await userService.getCustomerIdFromUsername(
            req.user.username
        );

        if (!customerId) {
            throw new Error("No customer_id in token");
        }

        const { recentlyViewed } = req.body;

        const newRecentList = await userService.syncRecentlyViewed(
            +customerId,
            recentlyViewed
        );

        res.json(newRecentList);
    } catch (error) {
        let errorObj = {
            message: "sync recently viewed failure",
            payload: error,
        };

        console.error(errorObj);

        res.status(500).json(errorObj);
    }
};
