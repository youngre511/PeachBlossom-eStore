import { sqlUser } from "../models/mysql/sqlUserModel.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import sequelize from "../models/mysql/index.js";
import { Model } from "sequelize";
import { sqlCustomer } from "../models/mysql/sqlCustomerModel.js";
import { sqlAdmin } from "../models/mysql/sqlAdminModel.js";
import { generateToken } from "../utils/jwt.js";

interface IUser extends Model {
    user_id: number;
    username: string;
    password: string;
    role: "customer" | "admin";
}

export const getAdmins = async () => {
    try {
        const adminList = await sqlUser.findAll({
            where: { role: "admin" },
            include: [
                {
                    model: sqlAdmin,
                    as: "admin",
                },
            ],
            nest: true,
        });

        const parsedAdminList = adminList.map((user) => {
            const parsedUser = user.get();
            delete parsedUser.password;
            if (parsedUser.admin) {
                const parsedAdmin = parsedUser.admin.get();
                parsedUser["admin_id"] = parsedAdmin.admin_id;
                parsedUser["accessLevel"] = parsedAdmin.accessLevel;
            }
            delete parsedUser.admin;
            return parsedUser;
        });

        return parsedAdminList;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Error getting admins: " + error.message);
        } else {
            throw new Error("An unknown error occurred while getting admins");
        }
    }
};

export const getCustomers = async () => {
    try {
        const adminList = await sqlUser.findAll({
            where: { role: "customer" },
            include: [
                {
                    model: sqlCustomer,
                    as: "customer",
                },
            ],
            nest: true,
        });

        const parsedCustomerList = adminList.map((user) => {
            const parsedUser = user.get();
            delete parsedUser.password;
            if (parsedUser.customer) {
                parsedUser.customer = parsedUser.customer.get();
            }
            return parsedUser;
        });

        return parsedCustomerList;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Error getting customers: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while getting customers"
            );
        }
    }
};

export const changeAdminAccessLevel = async (
    username: string,
    newAccessLevel: "full" | "limited" | "view only"
) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        if (username === "youngre511") {
            throw new Error("Cannot change site administrator's permissions");
        }

        const foundUser = await sqlUser.findOne({
            where: { username: username },
        });
        if (!foundUser || foundUser.role !== "admin") {
            throw new Error(`No admin with username ${username}`);
        }

        const [affectedCount] = await sqlAdmin.update(
            { accessLevel: newAccessLevel },
            {
                where: { user_id: foundUser.user_id },
                transaction: sqlTransaction,
            }
        );
        if (!affectedCount) {
            throw new Error(
                "Something went wrong when updating admin record. Unable to update admin table."
            );
        }
        await sqlTransaction.commit();
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error getting customers: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while getting customers"
            );
        }
    }
};

export const deleteUser = async (
    username: string,
    accessLevel: "full" | "limited" | "view only" | undefined
) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        if (username === "youngre511") {
            throw new Error("Cannot delete site administrator");
        }

        const foundUser = await sqlUser.findOne({
            where: { username: username },
        });
        if (!foundUser) {
            throw new Error(`No user with username ${username}`);
        }
        let deleteCount: number;
        if (foundUser.role === "admin") {
            if (!accessLevel || accessLevel !== "full") {
                throw new Error(
                    "Insufficient permissions to perform this action"
                );
            }
            deleteCount = await sqlAdmin.destroy({
                where: { user_id: foundUser.user_id },
                transaction: sqlTransaction,
            });
        } else {
            deleteCount = await sqlCustomer.destroy({
                where: { user_id: foundUser.user_id },
                transaction: sqlTransaction,
            });
        }

        if (!deleteCount) {
            throw new Error(
                `Something went wrong when deleting user account: unable to delete user from ${foundUser.role} table.`
            );
        }

        const userDeleteCount = await sqlUser.destroy({
            where: { user_id: foundUser.user_id },
            transaction: sqlTransaction,
        });
        if (!userDeleteCount) {
            throw new Error(
                `Something went wrong when deleting user account: unable to delete user from user table.`
            );
        }
        await sqlTransaction.commit();
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error deleting user account: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while deleting user account"
            );
        }
    }
};
