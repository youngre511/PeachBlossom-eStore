import { z } from "zod";
import { productNoSchema } from "./commonSchemas.js";
import { adminProductFilterSchema } from "./productValidators.js";

export const adjustHoldSchema = z.object({
    adjustment: z.number({ message: "Adjustment must be a number" }),
    productNo: productNoSchema,
    cartId: z.number({ message: "Invalid cart id format" }),
});

export const stockUpdateSchema = z.object({
    filters: adminProductFilterSchema,
    updateData: z.record(z.number()),
});
