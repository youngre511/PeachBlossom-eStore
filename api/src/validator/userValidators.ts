import { z } from "zod";
import {
    sanitizeStringSchema,
    shippingDetailsSchema,
} from "./commonSchemas.js";

export const getUsersSchema = z.object({
    page: z
        .string()
        .regex(/^\d+$/, { message: "Page must be a number" })
        .default("1"),
    usersPerPage: z
        .string({ message: "Users per page is required" })
        .regex(/^\d+$/, { message: "Items per page must be a number" }),

    accessLevel: sanitizeStringSchema("access level").optional(),
    searchString: sanitizeStringSchema("search string", 150).optional(),
});

export const changeUsernameSchema = z
    .object({
        newUsername: sanitizeStringSchema("new username"),
    })
    .passthrough();

export const changeDisplayNameSchema = z
    .object({
        newFirstName: sanitizeStringSchema("first name"),
        newLastName: sanitizeStringSchema("last name"),
    })
    .passthrough();

export const changeLevelSchema = z.object({
    username: sanitizeStringSchema("username"),
    newAccessLevel: z.enum(["full", "limited", "view only"]),
});

export const addAddressSchema = z.object({
    address: shippingDetailsSchema,
    nickname: sanitizeStringSchema("nickname").nullable(),
});

export const editAddressSchema = z.object({
    address: shippingDetailsSchema,
    nickname: sanitizeStringSchema("nickname").nullable(),
    addressId: z.number(),
});
