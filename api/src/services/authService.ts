import { sqlUser } from "../models/mysql/sqlUserModel.js";
import argon2 from "argon2";
import sequelize from "../models/mysql/index.js";
import { Model } from "sequelize";
import { sqlCustomer } from "../models/mysql/sqlCustomerModel.js";
import { sqlAdmin } from "../models/mysql/sqlAdminModel.js";
import { generateAccessToken, generateRefreshToken } from "../utils/jwt.js";
import { v4 as uuidv4 } from "uuid";
import { sqlRefreshToken } from "../models/mysql/sqlRefreshTokenModel.js";
import { loginCartProcessing } from "./cartService.js";
import { associateUserId } from "./activityService.js";

interface IUser extends Model {
    user_id: number;
    username: string;
    password: string;
    role: "customer" | "admin";
    defaultPassword: boolean;
}

/**
 * @description This function creates a new user record and an associated customer or admin record (depending on input).
 * It first ensures that all necessary data is present for the role being created and then confirms that the specified username (and email, in the case of customer accounts) is not already in use.
 * In addition to user and customer/admin records, the function also generates access and refresh tokens for the user and returns them.
 */
export const createUser = async (
    username: string,
    password: string,
    role: "customer" | "admin",
    accessLevel: "full" | "limited" | "view only" | null,
    email: string | null,
    defaultPassword: boolean,
    firstName: string | null,
    lastName: string | null,
    trackingId: string | null
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
                defaultPassword,
            },
            { transaction: sqlTransaction }
        );

        if (!createdUser) {
            throw new Error("Something went wrong while creating user");
        }

        /**
         * @description If a trackingId has been assigned to the user prior to account creation and has been provided through the activityMiddleware,
         * this step calls the associateUserId function to add the userId to all existing activity log records matching that tracking Id.
         * If the tracking id is already associated with another user, it assigns a new tracking id.
         * ActivityMiddleware ensures that a trackingId is only passed on to this function if the cookieConsent cookie indicates that the user has opted in to tracking.
         */
        let newTrackingId = null;
        if (trackingId && role === "customer") {
            newTrackingId = await associateUserId(username, trackingId);
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
                    recentlyViewed: [],
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

        const accessTokenPayload = {
            user_id: userData.user_id,
            username: userData.username,
            role: userData.role,
            customer_id: customer?.customer_id,
            firstName: customer?.firstName,
            lastName: customer?.lastName,
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

        await sqlRefreshToken.create(
            {
                user_id: userData.user_id,
                token: refreshToken,
                jti: jti,
                expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                revoked: false,
            },
            { transaction: sqlTransaction }
        );

        await sqlTransaction.commit();

        return { accessToken, refreshToken, newTrackingId };
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error creating new user: " + error.message);
        } else {
            throw new Error("An unknown error occurred while creating user");
        }
    }
};

/**
 * @description This function manages the multi-step process of logging in.
 * It finds the user account associated with the provided username and verifies that the provided password matches the password associated with the account.
 *
 * If the user in question is a customer, it looks up the customer_id and uses it to check for an existing associated cart_id.
 * Since a user can add items to the cart before logging in, and thereby generate a new cart_id, the function accepts an existing cart_id.
 * The function then returns a cartId, privileging the cartId associated with the user (if it exists). If both existing and user-associated cartIds exist, the function calls an external function to merge them.
 *
 * If there is an existing trackingId, the function then associates the user account with the trackingId.
 *
 * Finally, it generates a new accessToken and refreshToken.
 */
export const login = async (
    username: string,
    password: string,
    requiredRole: "customer" | "admin",
    cartId: number | null,
    trackingId: string | null = null
) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const user = await sqlUser.findOne({
            where: { username: username, role: requiredRole },
        });
        if (!user) {
            throw new Error(`Invalid ${requiredRole} username or password.`);
        }

        const isValidPassword = await argon2.verify(user.password, password);
        if (!isValidPassword) {
            throw new Error("Invalid username or password.");
        }

        let customer = null;
        let admin = null;
        let newCartId: number | null = null;
        let newTrackingId: string | null = null;

        if (user.role === "customer") {
            customer = await sqlCustomer.findOne({
                where: { user_id: user.user_id },
            });

            if (!customer) throw new Error("Unable to find customer record");

            newCartId = await loginCartProcessing(
                customer.customer_id,
                cartId,
                sqlTransaction
            );

            // Associating existing or assigning new trackingId

            if (trackingId) {
                console.log(
                    `Associating trackingId ${trackingId} with ${username}`
                );
                newTrackingId =
                    (await associateUserId(username, trackingId)) || null;
                if (newTrackingId) {
                    console.log("Association failed. Assigning new trackingId");
                }
            }
        } else if (user.role === "admin") {
            admin = await sqlAdmin.findOne({
                where: { user_id: user.user_id },
            });
        }

        const accessTokenPayload = {
            username: user.username,
            role: user.role,
            firstName: customer?.firstName,
            lastName: customer?.lastName,
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

        return {
            accessToken,
            refreshToken,
            role,
            newCartId,
            newTrackingId,
        };
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error(error.message);
        } else {
            throw new Error("An unknown error occurred while logging in");
        }
    }
};

/**
 * @description This function replaces an existing accessToken with a new one with a later expiration date.
 * @param jti - JSON web token id of refresh token
 * @param user_id - id of the user associated with the token
 */

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
            username: user.username,
            role: user.role,
            firstName: customer?.firstName,
            lastName: customer?.lastName,
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

/**
 * @description This function revokes an existing refresh token before its expiration. Used for logout.
 * @param jti - JSON web token id of refresh token
 */
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

/**
 * @description This function deletes an existing refresh token and replaces it with a freshly generated token.
 * @param jti - JSON web token id of refresh token
 * @param user_id - id of the current user
 */

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
