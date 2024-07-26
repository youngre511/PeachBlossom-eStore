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

export const createUser = async (
    username: string,
    password: string,
    role: "customer" | "admin",
    accessLevel: "full" | "limited" | "view only" | null,
    email: string | null
) => {
    const sqlTransaction = await sequelize.transaction();

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

        const tokenPayload = {
            user_id: userData.user_id,
            role: userData.role,
            customer_id: customer?.customer_id,
            admin_id: admin?.admin_id,
            accessLevel: admin?.accessLevel,
        };
        const token = generateToken(tokenPayload);

        return token;
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error creating new user: " + error.message);
        } else {
            throw new Error("An unknown error occurred while creating user");
        }
    }
};

export const login = async (username: string, password: string) => {
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

        const tokenPayload = {
            user_id: user.user_id,
            role: user.role,
            customer_id: customer?.customer_id,
            admin_id: admin?.admin_id,
            accessLevel: admin?.accessLevel,
        };
        const token = generateToken(tokenPayload);
        return token;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error("Error logging in: " + error.message);
        } else {
            throw new Error("An unknown error occurred while logging in");
        }
    }
};
