import { z } from "zod";

// Function that returns a decimal schema with a dynamic parameter name
export const createDecimalSchema = (paramName: string) =>
    z
        .string()
        .regex(/^\d+(\.\d{1,2})?$/, { message: `Invalid ${paramName} format` })
        .optional();

// Function to escape HTML characters
const escapeHTML = (str: string) =>
    str.replace(
        /[&<>"'/]/g,
        (char) =>
            ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
                "/": "&#x2F;",
            }[char] || char)
    );

export const sanitizeStringSchema = (
    paramName: string,
    maxLength: number = 255
) =>
    z
        .string()
        .trim()
        .min(1, `${paramName} cannot be empty`)
        .max(maxLength, `${paramName} is too long`)
        .transform((val) => escapeHTML(val));

export const sanitizeEmailSchema = () =>
    z
        .string()
        .trim()
        .email()
        .min(5, `email cannot be empty`)
        .max(320, `email is too long`)
        .transform((val) => escapeHTML(val));

export const productNoSchema = z.string().regex(/^[A-Za-z]{2}-[A-Za-z0-9]+$/, {
    message: "Invalid product number format",
});

// Pagination (Sanitization, not required checks)
export const paginationSchema = z.object({
    page: z
        .string()
        .regex(/^\d+$/, { message: "Page must be a number" })
        .default("1"),
    itemsPerPage: z
        .string({ message: "Items per page is required" })
        .regex(/^\d+$/, { message: "Items per page must be a number" }),
});

export const categoriesSchema = z.object({
    category: sanitizeStringSchema("category name", 20).optional(),
    subcategory: sanitizeStringSchema("subcategory name", 20).optional(),
});

// Filters (Sanitization, not required checks)
export const filterSchema = z.object({
    search: sanitizeStringSchema("search string", 150).optional(),
    sort: sanitizeStringSchema("sort"),
    tags: z.array(sanitizeStringSchema("tag", 20)).optional(),
});
