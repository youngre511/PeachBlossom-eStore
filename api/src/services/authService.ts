import { sqlUser } from "../models/mysql/sqlUserModel.js";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import sequelize from "../models/mysql/index.js";
import { Model } from "sequelize";
import { sqlCustomer } from "../models/mysql/sqlCustomerModel.js";
import { sqlAdmin } from "../models/mysql/sqlAdminModel.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { v4 as uuidv4 } from "uuid";
import { sqlRefreshToken } from "../models/mysql/sqlRefreshTokenModel.js";

interface IUser extends Model {
    user_id: number;
    username: string;
    password: string;
    role: "customer" | "admin";
    defaultPassword: boolean;
}

export const createUser = async (
    username: string,
    password: string,
    role: "customer" | "admin",
    accessLevel: "full" | "limited" | "view only" | null,
    email: string | null,
    defaultPassword: boolean,
    firstName: string | null,
    lastName: string | null
) => {
    const sqlTransaction = await sequelize.transaction();
    const sqlTransaction2 = await sequelize.transaction();

    try {
        if (role === "customer" && !email) {
            throw new Error("Email required");
        }

        if (role === "admin" && !accessLevel) {
            throw new Error("Must specify admin access level");
        }

        if (role === "customer") {
            let customerUser = await sqlCustomer.findOne({
                where: { email: email },
                transaction: sqlTransaction,
            });
            if (customerUser) {
                throw new Error(
                    "This email is already associated with an account."
                );
            }
        }

        let foundUsername = await sqlUser.findOne({
            where: { username: username },
            transaction: sqlTransaction,
        });
        if (foundUsername) {
            throw new Error("Username already taken");
        }

        const hashedPassword = await argon2.hash(password);

        const createdUser: IUser = await sqlUser.create(
            {
                username: username,
                password: hashedPassword,
                role: role,
                defaultPassword,
            },
            { transaction: sqlTransaction }
        );

        if (!createdUser) {
            throw new Error("Something went wrong while creating user");
        }

        const userData = createdUser.get();

        let customer = null;
        let admin = null;

        if (role === "customer") {
            customer = await sqlCustomer.create(
                {
                    user_id: userData.user_id,
                    email: email,
                    firstName: firstName,
                    lastName: lastName,
                },
                { transaction: sqlTransaction }
            );
            if (!customer) {
                throw new Error("Something went wrong while creating customer");
            }
        } else if (role === "admin") {
            admin = await sqlAdmin.create(
                {
                    user_id: userData.user_id,
                    accessLevel: accessLevel,
                },
                { transaction: sqlTransaction }
            );
            if (!admin) {
                throw new Error("Something went wrong while creating admin");
            }
        }

        await sqlTransaction.commit();

        const accessTokenPayload = {
            user_id: userData.user_id,
            username: userData.username,
            role: userData.role,
            customer_id: customer?.customer_id,
            firstName: customer?.firstName,
            admin_id: admin?.admin_id,
            accessLevel: admin?.accessLevel,
            defaultPassword: userData.defaultPassword,
        };

        const jti = uuidv4();

        const refreshTokenPayload = {
            user_id: userData.user_id,
            iat: Math.floor(Date.now() / 1000),
            jti: jti,
        };

        const accessToken = generateAccessToken(accessTokenPayload);
        const refreshToken = generateRefreshToken(refreshTokenPayload);

        await sqlRefreshToken.create({
            user_id: userData.user_id,
            token: refreshToken,
            jti: jti,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            revoked: false,
        });

        await sqlTransaction2.commit();

        return { accessToken, refreshToken };
    } catch (error) {
        await sqlTransaction.rollback();
        await sqlTransaction2.rollback();
        if (error instanceof Error) {
            throw new Error("Error creating new user: " + error.message);
        } else {
            throw new Error("An unknown error occurred while creating user");
        }
    }
};

export const login = async (username: string, password: string) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const user = await sqlUser.findOne({ where: { username: username } });
        if (!user) {
            throw new Error("Invalid username or password.");
        }

        const isValidPassword = await argon2.verify(user.password, password);
        if (!isValidPassword) {
            throw new Error("Invalid username or password.");
        }

        let customer = null;
        let admin = null;

        if (user.role === "customer") {
            customer = await sqlCustomer.findOne({
                where: { user_id: user.user_id },
            });
        } else if (user.role === "admin") {
            admin = await sqlAdmin.findOne({
                where: { user_id: user.user_id },
            });
        }

        console.log("CUSTOMER:", customer);
        console.log(customer?.firstName);

        const accessTokenPayload = {
            user_id: user.user_id,
            username: user.username,
            role: user.role,
            customer_id: customer?.customer_id,
            firstName: customer?.firstName,
            admin_id: admin?.admin_id,
            accessLevel: admin?.accessLevel,
            defaultPassword: user.defaultPassword,
        };

        const jti = uuidv4();

        const refreshTokenPayload = {
            user_id: user.user_id,
            iat: Math.floor(Date.now() / 1000),
            jti: jti,
        };

        const accessToken = generateAccessToken(accessTokenPayload);
        const refreshToken = generateRefreshToken(refreshTokenPayload);

        await sqlRefreshToken.create({
            user_id: user.user_id,
            token: refreshToken,
            jti: jti,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            revoked: false,
        });

        await sqlTransaction.commit();

        const role = user.role;

        return { accessToken, refreshToken, role };
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error("An unknown error occurred while logging in");
        }
    }
};

export const refreshAccessToken = async (user_id: number, oldJti: string) => {
    try {
        console.log("refreshing user access token");
        const user = await sqlUser.findOne({ where: { user_id: user_id } });
        if (!user) {
            throw new Error("Invalid user_id.");
        }

        let customer = null;
        let admin = null;

        if (user.role === "customer") {
            customer = await sqlCustomer.findOne({
                where: { user_id: user.user_id },
            });
        } else if (user.role === "admin") {
            admin = await sqlAdmin.findOne({
                where: { user_id: user.user_id },
            });
        }

        const accessTokenPayload = {
            user_id: user.user_id,
            username: user.username,
            role: user.role,
            customer_id: customer?.customer_id,
            firstName: customer?.firstName,
            admin_id: admin?.admin_id,
            accessLevel: admin?.accessLevel,
        };

        const newAccessToken = generateAccessToken(accessTokenPayload);
        const newRefreshToken = await rotateRefreshToken(user.user_id, oldJti);

        return { newAccessToken, newRefreshToken };
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error(
                "An unknown error occurred while refreshing access token"
            );
        }
    }
};

export const revokeRefreshToken = async (jti: string) => {
    console.log("revoking refresh token");
    const sqlTransaction = await sequelize.transaction();
    try {
        const [affectedCount] = await sqlRefreshToken.update(
            { revoked: true },
            { where: { jti: jti }, transaction: sqlTransaction }
        );
        if (affectedCount !== 1) {
            throw new Error("Unable to revoke refresh token.");
        }
        await sqlTransaction.commit();
        return;
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error(
                "An unknown error occurred while revoking refresh token"
            );
        }
    }
};

const rotateRefreshToken = async (user_id: number, oldJti: string) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        await revokeRefreshToken(oldJti);

        const jti = uuidv4();

        const newRefreshTokenPayload = {
            user_id: user_id,
            iat: Math.floor(Date.now() / 1000),
            jti: jti,
        };

        const newRefreshToken = generateRefreshToken(newRefreshTokenPayload);
        console.log("issuing new refresh token");
        await sqlRefreshToken.create({
            user_id: user_id,
            token: newRefreshToken,
            jti: jti,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            revoked: false,
        });

        await sqlTransaction.commit();
        return newRefreshToken;
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error(
                "An unknown error occurred while revoking refresh token"
            );
        }
    }
};
