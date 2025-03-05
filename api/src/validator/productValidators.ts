import { z } from "zod";
import {
    categoriesSchema,
    createDecimalSchema,
    filterSchema,
    paginationSchema,
    productNoSchema,
    sanitizeStringSchema,
} from "./commonSchemas.js";
import { colorsList, materialsList } from "../models/mongo/productModel.js";

const attributesSchema = z.object({
    color: z.enum(colorsList),
    material: z.array(z.enum(materialsList)),
    weight: z.preprocess((val) => Number(val), z.number()),
    dimensions: z.object({
        width: z.preprocess((val) => Number(val), z.number()),
        height: z.preprocess((val) => Number(val), z.number()),
        depth: z.preprocess((val) => Number(val), z.number()),
    }),
});

export const productFilterSchema = z.object({
    ...paginationSchema.shape,
    ...filterSchema.shape,
    ...categoriesSchema.shape,
    minPrice: createDecimalSchema("minimum price"),
    maxPrice: createDecimalSchema("maximum price"),
    minWidth: createDecimalSchema("minimum width"),
    maxWidth: createDecimalSchema("maximum width"),
    minHeight: createDecimalSchema("minimum height"),
    maxHeight: createDecimalSchema("maximum height"),
    minDepth: createDecimalSchema("minimum depth"),
    maxDepth: createDecimalSchema("maximum depth"),
    color: z.array(z.enum(colorsList)).optional(),
    material: z.array(z.enum(materialsList)).optional(),
});

export const adminProductFilterSchema = z.object({
    ...paginationSchema.shape,
    ...Object.fromEntries(
        Object.entries(categoriesSchema.shape).map(([key, schema]) => [
            key,
            schema.nullable(),
        ])
    ),
    ...Object.fromEntries(
        Object.entries(filterSchema.shape).map(([key, schema]) => [
            key,
            schema.nullable(),
        ])
    ),
    view: sanitizeStringSchema("view", 20),
});

export const createProductSchema = z.object({
    name: sanitizeStringSchema("product name", 100),
    category: sanitizeStringSchema("category", 20, 1, true),
    subcategory: sanitizeStringSchema("category", 20, 1, true).optional(),
    prefix: sanitizeStringSchema("prefix", 2),
    description: sanitizeStringSchema("description", 5000),
    price: z.preprocess(
        (val) => Number(val),
        z.number({ message: "Price must be a number" })
    ),
    attributes: z.preprocess(
        (value) => (typeof value === "string" ? JSON.parse(value) : value),
        attributesSchema
    ),
    stock: z
        .preprocess(
            (val) => Number(val),
            z.number({ message: "Stock must be a number" })
        )
        .optional(),
    tags: sanitizeStringSchema("tag", 20).optional(),
});

export const updateProductSchema = z.object({
    ...createProductSchema.omit({ prefix: true, stock: true }).partial().shape,
    existingImageUrls: z
        .preprocess(
            (value) => (Array.isArray(value) ? value : [value]),
            z.array(z.string({ message: "Invalid url format" }).url())
        )
        .optional(),
    productNo: productNoSchema,
});

export const productNoParamSchema = z.object({
    productNo: productNoSchema,
});
