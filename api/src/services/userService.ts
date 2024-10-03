import { sqlUser } from "../models/mysql/sqlUserModel.js";
import argon2 from "argon2";
import sequelize from "../models/mysql/index.js";
import { Model } from "sequelize";
import { sqlCustomer } from "../models/mysql/sqlCustomerModel.js";
import { sqlAdmin } from "../models/mysql/sqlAdminModel.js";
import { Op } from "sequelize";
import { generateAccessToken, UserPayload } from "../utils/jwt.js";
import { sqlRefreshToken } from "../models/mysql/sqlRefreshTokenModel.js";
import { ReceivedUser } from "../middleware/authMiddleware.js";
import { sqlOrder } from "../models/mysql/sqlOrderModel.js";

interface IUser extends Model {
    user_id: number;
    username: string;
    password: string;
    defaultPassword: boolean;
    role: "customer" | "admin";
}

export const getAdmins = async (
    page: number,
    usersPerPage: number,
    accessLevel: Array<"full" | "limited" | "view only">,
    searchString?: string
) => {
    try {
        const offset = (page - 1) * usersPerPage;
        const whereClause: any = { [Op.and]: [{ role: "admin" }] };
        const adminWhereClause: any = {
            [Op.and]: [{ accessLevel: { [Op.in]: accessLevel } }],
        };
        if (searchString) {
            whereClause[Op.or] = [
                { user_id: { [Op.eq]: searchString } },
                { username: { [Op.like]: `%${searchString}%` } },
            ];
            adminWhereClause[Op.or] = [{ admin_id: { [Op.eq]: searchString } }];
        }
        const adminResponse = await sqlUser.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: sqlAdmin,
                    as: "admin",
                    where: adminWhereClause,
                },
            ],
            nest: true,
            limit: usersPerPage,
            offset: offset,
        });

        const adminList = adminResponse.rows;

        const parsedAdminList = adminList.map((user) => {
            const parsedUser = user.get();
            delete parsedUser.password;
            if (parsedUser.admin) {
                const parsedAdmin = parsedUser.admin.get();
                parsedUser["admin_id"] = parsedAdmin.admin_id;
                parsedUser["accessLevel"] = parsedAdmin.accessLevel;
            }
            if (parsedUser.defaultPassword === 0) {
                parsedUser.defaultPassword = false;
            } else if (parsedUser.defaultPassword === 1) {
                parsedUser.defaultPassword = true;
            }
            delete parsedUser.admin;
            return parsedUser;
        });

        return { admins: parsedAdminList, numberOfAdmins: adminResponse.count };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Error getting admins: " + error.message);
        } else {
            throw new Error("An unknown error occurred while getting admins");
        }
    }
};

export const getCustomers = async (
    page: number,
    usersPerPage: number,
    searchString?: string
) => {
    try {
        console.log("Searchstring:", searchString);
        const offset = (page - 1) * usersPerPage;
        const whereClause: any = { [Op.and]: [{ role: "customer" }] };
        const customerWhereClause: any = {};
        if (searchString) {
            whereClause[Op.or] = [
                { user_id: { [Op.eq]: searchString } },
                { username: { [Op.like]: `%${searchString}%` } },
                { "$customer.customer_id$": { [Op.eq]: searchString } },
                { "$customer.email$": { [Op.like]: `%${searchString}%` } },
            ];
        }
        const customerResponse = await sqlUser.findAndCountAll({
            where: whereClause,
            include: [
                {
                    model: sqlCustomer,
                    as: "customer",
                    where: customerWhereClause,
                    attributes: [
                        "customer_id",
                        "email",
                        [
                            sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM Orders AS OrderTable
                            WHERE
                              OrderTable.customer_id = customer.customer_id
                          )`),
                            "totalOrders",
                        ],
                        [
                            sequelize.literal(`(
                            SELECT SUM(OrderTable.subTotal)
                            FROM Orders AS OrderTable
                            WHERE
                              OrderTable.customer_id = customer.customer_id
                          )`),
                            "totalSpent",
                        ],
                    ],
                },
            ],
            nest: true,
            limit: usersPerPage,
            offset: offset,
        });

        const customerList = customerResponse.rows;
        const parsedCustomerList = customerList.map((user) => {
            const parsedUser = user.get();
            delete parsedUser.password;
            if (parsedUser.customer) {
                const parsedCustomer = parsedUser.customer.get();
                parsedUser.customer_id = parsedCustomer.customer_id;
                parsedUser.email = parsedCustomer.email;
                parsedUser.totalSpent = parsedCustomer.totalSpent;
                parsedUser.totalOrders = parsedCustomer.totalOrders;
            }
            if (parsedUser.defaultPassword === 0) {
                parsedUser.defaultPassword = false;
            } else if (parsedUser.defaultPassword === 1) {
                parsedUser.defaultPassword = true;
            }
            delete parsedUser.customer;
            return parsedUser;
        });

        return {
            customers: parsedCustomerList,
            numberOfCustomers: customerResponse.count,
        };
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

export const resetPassword = async (user_id: number) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const foundUser = await sqlUser.findByPk(user_id);
        if (!foundUser) {
            throw new Error(`User does not exist`);
        }

        if (foundUser.dataValues.username === "youngre511") {
            throw new Error("Cannot reset site administrator's password");
        }

        const hashedPassword = await argon2.hash("default");

        const [affectedCount] = await sqlUser.update(
            { defaultPassword: true, password: hashedPassword },
            {
                where: { user_id: user_id },
                transaction: sqlTransaction,
            }
        );
        if (!affectedCount) {
            throw new Error(
                "Something went wrong when resetting password. Unable to update sqlUser table."
            );
        }
        await sqlTransaction.commit();
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error resetting password: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while resetting password"
            );
        }
    }
};

export const changePassword = async (
    user: ReceivedUser,
    oldPassword: string,
    newPassword: string
) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const foundUser = await sqlUser.findOne({
            where: { username: user.username },
        });
        if (!foundUser) {
            throw new Error(`User does not exist`);
        }

        if (await argon2.verify(foundUser.password, oldPassword)) {
            console.log("Old password verified");
        } else {
            return false;
        }

        const hashedPassword = await argon2.hash(newPassword);

        const [affectedCount] = await sqlUser.update(
            { defaultPassword: false, password: hashedPassword },
            {
                where: { username: user.username },
                transaction: sqlTransaction,
            }
        );
        if (!affectedCount) {
            throw new Error(
                "Something went wrong when changing password. Unable to update sqlUser table."
            );
        }
        await sqlTransaction.commit();
        const newTokenPayload: any = { ...user, defaultPassword: false };
        delete newTokenPayload.iat;
        delete newTokenPayload.exp;
        const updatedAccessToken = generateAccessToken(
            newTokenPayload as UserPayload
        );

        return updatedAccessToken;
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error changing password: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while changing password"
            );
        }
    }
};

export const deleteUser = async (
    userId: string,
    accessLevel: "full" | "limited" | "view only" | undefined
) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const foundUser = await sqlUser.findByPk(+userId);
        if (!foundUser) {
            throw new Error(`User does not exist`);
        }

        if (foundUser.dataValues.username === "youngre511") {
            throw new Error("Cannot delete site administrator");
        }

        let deleteCount: number;
        if (foundUser.dataValues.role === "admin") {
            if (!accessLevel || accessLevel !== "full") {
                throw new Error(
                    "Insufficient permissions to perform this action"
                );
            }
            deleteCount = await sqlAdmin.destroy({
                where: { user_id: userId },
                transaction: sqlTransaction,
            });
        } else {
            deleteCount = await sqlCustomer.destroy({
                where: { user_id: userId },
                transaction: sqlTransaction,
            });
        }

        if (!deleteCount) {
            throw new Error(
                `Something went wrong when deleting user account: unable to delete user from ${foundUser.role} table.`
            );
        }

        await sqlRefreshToken.destroy({
            where: { user_id: userId },
            transaction: sqlTransaction,
        });

        const userDeleteCount = await sqlUser.destroy({
            where: { user_id: userId },
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
