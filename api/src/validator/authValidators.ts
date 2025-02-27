import { z } from "zod";
import { sanitizeEmailSchema, sanitizeStringSchema } from "./commonSchemas.js";

export const createUserSchema = z
    .object({
        username: sanitizeStringSchema("username"),
        role: z.enum(["customer", "admin"]),
        accessLevel: z.enum(["full", "limited"]).optional(),
        email: sanitizeEmailSchema().optional(),
        defaultPassword: z.boolean().optional(),
        firstName: sanitizeStringSchema("first name").optional(),
        lastName: sanitizeStringSchema("last name").optional(),
    })
    .passthrough();

export const loginSchema = z
    .object({
        username: sanitizeStringSchema("username"),
    })
    .passthrough();
