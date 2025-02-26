import { z } from "zod";
import {
    createDecimalSchema,
    paginationSchema,
    productNoSchema,
    sanitizeEmailSchema,
    sanitizeStringSchema,
} from "./commonSchemas.js";

const shippingDetailsSchema = z.object({
    shippingAddress: sanitizeStringSchema("shipping address"),
    shippingAddress2: sanitizeStringSchema(
        "shipping address line 2"
    ).optional(),
    firstName: sanitizeStringSchema("first name"),
    lastName: sanitizeStringSchema("last name"),
    zipCode: sanitizeStringSchema("zip code", 10),
    phoneNumber: sanitizeStringSchema("phone number", 15),
    stateAbbr: sanitizeStringSchema("state abbreviation", 2),
    city: sanitizeStringSchema("city", 60),
});

const orderItemSchema = z.object({
    productNo: productNoSchema,
    quantity: z.number(),
    priceAtCheckout: createDecimalSchema("price at checkout"),
});

const orderDetailsSchema = z.object({
    subTotal: z.number({ message: "Subtotal must be a number" }),
    shipping: z.number({ message: "Shipping cost must be a number" }),
    tax: z.number({ message: "Tax rate must be a number" }),
    totalAmount: z.number({ message: "Total must be a number" }),
    items: z.array(orderItemSchema),
});

export const orderDataSchema = z.object({
    cartId: z.number({ message: "CartId must be a number" }).nullable(),
    shipping: shippingDetailsSchema,
    email: sanitizeEmailSchema(),
    orderDetails: orderDetailsSchema,
});

const updateItemSchema = z
    .object({
        quantity: z.number({ message: "Quantity must be a number" }),
    })
    .passthrough();

export const updateOrderDataSchema = z.object({
    ...shippingDetailsSchema.omit({ firstName: true, lastName: true }).shape,
    ...orderDetailsSchema.omit({ items: true }).shape,
    orderNo: sanitizeStringSchema("orderNo"),
    orderStatus: sanitizeStringSchema("order status"),
    items: z.array(updateItemSchema),
});

export const ordersFilterSchema = z.object({
    ...paginationSchema.shape,
    sort: sanitizeStringSchema("sort"),
    orderStatus: z.array(sanitizeStringSchema("order status")).optional(),
    search: sanitizeStringSchema("search", 150).optional(),
    state: z.array(sanitizeStringSchema("state abbreviation", 2)).optional(),
    customerId: z.number().optional(),
    startDate: z
        .string({ message: "Date must be in ISO format" })
        .date()
        .optional(),
    endDate: z
        .string({ message: "Date must be in ISO format" })
        .date()
        .optional(),
});
