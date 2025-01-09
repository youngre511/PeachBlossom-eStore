import { sqlUser } from "../models/mysql/sqlUserModel.js";
import argon2 from "argon2";
import sequelize from "../models/mysql/index.js";
import { AssociationOptions, Transaction } from "sequelize";
import {
    AddAddressOptions,
    sqlCustomer,
} from "../models/mysql/sqlCustomerModel.js";
import { sqlAdmin } from "../models/mysql/sqlAdminModel.js";
import { Op } from "sequelize";
import { generateAccessToken, UserPayload } from "../utils/jwt.js";
import { sqlRefreshToken } from "../models/mysql/sqlRefreshTokenModel.js";
import { ReceivedUser } from "../middleware/authMiddleware.js";
import { ShippingDetails } from "../controllers/orderController.js";
import { sqlAddress } from "../models/mysql/sqlAddressModel.js";
import { sqlOrder } from "../models/mysql/sqlOrderModel.js";
import { sqlCustomerAddress } from "../models/mysql/sqlCustomerAddressModel.js";

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

export const changeUsername = async (
    user: ReceivedUser,
    newUsername: string,
    password: string
) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const foundUser = await sqlUser.findOne({
            where: { user_id: user.username },
        });
        if (!foundUser) {
            throw new Error(`User does not exist`);
        }

        if (await argon2.verify(foundUser.password, password)) {
            console.log("Password verified");
        } else {
            return false;
        }

        const [affectedCount] = await sqlUser.update(
            { username: newUsername },
            {
                where: { user_id: foundUser.user_id },
                transaction: sqlTransaction,
            }
        );
        if (!affectedCount) {
            throw new Error(
                "Something went wrong when changing username. Unable to update sqlUser table."
            );
        }

        const [customerAffectedCount] = await sqlCustomer.update(
            { email: newUsername },
            {
                where: { user_id: foundUser.user_id },
                transaction: sqlTransaction,
            }
        );

        if (!customerAffectedCount) {
            throw new Error(
                "Something went wrong when changing username. Unable to update sqlCustomer table."
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
            throw new Error("Error changing username: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while changing username"
            );
        }
    }
};

export const changeDisplayName = async (
    user: ReceivedUser,
    newFirstName: string,
    newLastName: string,
    password: string
) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const foundUser = await sqlUser.findOne({
            where: { user_id: user.username },
        });
        if (!foundUser) {
            throw new Error(`User does not exist`);
        }

        if (await argon2.verify(foundUser.password, password)) {
            console.log("Password verified");
        } else {
            return false;
        }

        const [customerAffectedCount] = await sqlCustomer.update(
            { firstName: newFirstName, lastName: newLastName },
            {
                where: { user_id: foundUser.user_id },
                transaction: sqlTransaction,
            }
        );

        if (!customerAffectedCount) {
            throw new Error(
                "Something went wrong when changing display name. Unable to update sqlCustomer table."
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
            throw new Error("Error changing display name: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while changing display name"
            );
        }
    }
};

export const deleteUser = async (
    data:
        | {
              userId: string;
              accessLevel: "full" | "limited" | "view only" | undefined;
          }
        | {
              username: string;
              password: string;
          }
) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        let foundUser;
        let whereClause;

        if ("userId" in data) {
            foundUser = await sqlUser.findByPk(+data.userId, {
                transaction: sqlTransaction,
            });
            whereClause = { user_id: +data.userId };
        } else {
            foundUser = await sqlUser.findOne({
                where: { username: data.username },
                transaction: sqlTransaction,
            });
            whereClause = { username: data.username };
        }

        if (!foundUser) {
            throw new Error(`User does not exist`);
        }

        if (foundUser.dataValues.username === "youngre511") {
            throw new Error("Cannot delete site administrator");
        }

        if ("password" in data) {
            const passwordValid = await argon2.verify(
                foundUser.password,
                data.password
            );
            if (!passwordValid) {
                throw new Error("Password is incorrect. Please try again");
            }
        }

        const userDeleteCount = await sqlUser.destroy({
            where: whereClause,
            transaction: sqlTransaction,
        });

        if (!userDeleteCount) {
            throw new Error(`Unable to delete user account.`);
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

export const getCustomerAddresses = async (
    customerId: number,
    transaction?: Transaction
) => {
    try {
        const addresses = await sqlAddress.findAll({
            attributes: [
                [
                    sequelize.col("customers.sqlCustomerAddress.nickname"),
                    "nickname",
                ],
                "address_id",
                "shippingAddress",
                "firstName",
                "lastName",
                "city",
                "stateAbbr",
                "zipCode",
                "phoneNumber",
            ],
            include: [
                {
                    model: sqlCustomer,
                    where: { customer_id: customerId },
                    through: {
                        attributes: ["nickname"],
                    },
                    attributes: [],
                    required: true,
                },
            ],
            transaction,
        });
        return addresses;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(
                "Error fetching customer address: " + error.message
            );
        } else {
            throw new Error(
                "An unknown error occurred while fetching customer addresses"
            );
        }
    }
};

export const removeCustomerAddress = async (
    customerId: number,
    addressId: number,
    transaction?: Transaction
) => {
    const sqlTransaction = transaction
        ? transaction
        : await sequelize.transaction();
    try {
        const foundCustomer = await sqlCustomer.findByPk(customerId, {
            transaction: sqlTransaction,
        });
        if (!foundCustomer) throw new Error("Customer not found");

        await foundCustomer.removeAddress(addressId, {
            transaction: sqlTransaction,
        });

        const isUsed = await isAddressUsed(addressId, sqlTransaction);

        if (!isUsed) {
            await sqlAddress.destroy({
                where: { address_id: addressId },
                transaction: sqlTransaction,
            });
        }

        const newAddressList = await getCustomerAddresses(
            customerId,
            sqlTransaction
        );

        if (!transaction) await sqlTransaction.commit();

        return newAddressList;
    } catch (error) {
        if (!transaction) await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error(
                "Error removing customer address: " + error.message
            );
        } else {
            throw new Error(
                "An unknown error occurred while removing customer address"
            );
        }
    }
};

export const addCustomerAddress = async (
    customerId: number,
    address: ShippingDetails,
    nickname: string | null,
    transaction?: Transaction
) => {
    const sqlTransaction = transaction
        ? transaction
        : await sequelize.transaction();
    try {
        const foundCustomer = await sqlCustomer.findByPk(customerId, {
            transaction: sqlTransaction,
        });
        if (!foundCustomer) {
            throw new Error("Customer_id not found");
        }

        const addressData = JSON.parse(JSON.stringify(address));
        if (addressData.shippingAddress2)
            addressData.shippingAddress = `${addressData.shippingAddress} | ${addressData.shippingAddress2}`;
        delete addressData.shippingAddress2;

        let addressRecord = await sqlAddress.findOne({
            where: addressData,
            transaction: sqlTransaction,
        });

        if (!addressRecord) {
            addressRecord = await sqlAddress.create(addressData, {
                transaction: sqlTransaction,
            });
        }

        if (!addressRecord) {
            throw new Error("Unable to add address to database");
        }

        const options: AddAddressOptions = { transaction: sqlTransaction };
        if (nickname && nickname !== "null" && nickname.trim() !== "")
            options.through = { nickname: nickname };
        await foundCustomer.addAddress(addressRecord.address_id, options);

        const newAddressList = await getCustomerAddresses(
            customerId,
            sqlTransaction
        );

        if (!transaction) await sqlTransaction.commit();

        return newAddressList;
    } catch (error) {
        if (!transaction) await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error adding customer address: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while adding customer address"
            );
        }
    }
};

export const editCustomerAddress = async (
    customerId: number,
    addressId: number,
    newAddress: ShippingDetails,
    newNickname: string | null
) => {
    const sqlTransaction = await sequelize.transaction();
    try {
        const foundAddress = await sqlAddress.findByPk(addressId, {
            transaction: sqlTransaction,
        });

        if (!foundAddress) {
            const addressList = await addCustomerAddress(
                customerId,
                newAddress,
                newNickname,
                sqlTransaction
            );
            return addressList;
        }

        const isUsed = await isAddressUsed(
            addressId,
            sqlTransaction,
            customerId
        );

        if (isUsed) {
            await removeCustomerAddress(customerId, addressId, sqlTransaction);
            const addressList = await addCustomerAddress(
                customerId,
                newAddress,
                newNickname,
                sqlTransaction
            );
            return addressList;
        }

        const addressData = JSON.parse(JSON.stringify(newAddress));
        if (addressData.shippingAddress2)
            addressData.shippingAddress = `${addressData.shippingAddress} | ${addressData.shippingAddress2}`;
        delete addressData.shippingAddress2;

        await foundAddress.update(addressData, { transaction: sqlTransaction });

        const joinEntry = await sqlCustomerAddress.findOne({
            where: { customer_id: customerId, address_id: addressId },
            transaction: sqlTransaction,
        });
        if (!joinEntry)
            throw new Error(
                "Unable to find or access customer address association"
            );

        if (joinEntry.nickname !== newNickname) {
            await joinEntry.update(
                { nickname: newNickname },
                { transaction: sqlTransaction }
            );
        }

        const newAddressList = await getCustomerAddresses(
            customerId,
            sqlTransaction
        );

        await sqlTransaction.commit();

        return newAddressList;
    } catch (error) {
        await sqlTransaction.rollback();
        if (error instanceof Error) {
            throw new Error("Error editing customer address: " + error.message);
        } else {
            throw new Error(
                "An unknown error occurred while editing customer address"
            );
        }
    }
};

const isAddressUsed = async (
    addressId: number,
    sqlTransaction: Transaction,
    customerId?: number
) => {
    const associatedOrders = await sqlOrder.findOne({
        where: { address_id: addressId },
        transaction: sqlTransaction,
    });

    const customerWhereClause = customerId
        ? { customer_id: { [Op.ne]: customerId } }
        : undefined;

    const associatedCustomers = await sqlCustomer.findOne({
        where: customerWhereClause,
        include: [{ model: sqlAddress, where: { address_id: addressId } }],
        transaction: sqlTransaction,
    });

    if (associatedCustomers || associatedOrders) {
        return true;
    }

    return false;
};
