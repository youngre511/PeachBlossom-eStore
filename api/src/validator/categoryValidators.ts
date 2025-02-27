import { z } from "zod";
import { sanitizeStringSchema } from "./commonSchemas.js";

export const categoryNameSchema = z
    .object({
        name: sanitizeStringSchema("category name", 20).optional(),
        categoryName: sanitizeStringSchema("category name", 20).optional(),
    })
    .refine((data) => (data.name ? !data.categoryName : !!data.name), {
        message: "Provide either 'categoryName' or 'name', not both",
    });

export const subcategoryNameSchema = z.object({
    subcategoryName: sanitizeStringSchema("category name", 20),
});

export const categoryNameUpdateSchema = z.object({
    oldName: sanitizeStringSchema("category name", 20),
    newName: sanitizeStringSchema("category name", 20),
});
