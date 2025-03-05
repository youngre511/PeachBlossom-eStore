import { z } from "zod";
import { sanitizeStringSchema } from "./commonSchemas.js";

export const categoryNameSchema = z
    .object({
        name: sanitizeStringSchema("category name", 20, 1, true).optional(),
        categoryName: sanitizeStringSchema(
            "category name",
            20,
            1,
            true
        ).optional(),
    })
    .refine((data) => (data.name ? !data.categoryName : !!data.categoryName), {
        message: "Provide either 'categoryName' or 'name', not both",
    });

export const subcategoryNameSchema = z.object({
    subcategoryName: sanitizeStringSchema("subcategory name", 20, 1, true),
});

export const categoryNameUpdateSchema = z.object({
    oldName: sanitizeStringSchema("category name", 20, 1, true),
    newName: sanitizeStringSchema("category name", 20, 1, true),
});
