import { getSalesTax } from "sales-tax";

export interface Order {
    id: number;
    from_zip: string;
    from_state: string;
    from_city: string;
    from_street: string;
    to_zip: string;
    to_state: string;
    to_city: string;
    to_street: string;
    amount: number;
    shipping: number;
}

export async function calculateSalesTax(order: Order): Promise<number> {
    try {
        const tax = await getSalesTax("US", order.to_state, order.to_city);
        const taxAmount = order.amount * tax.rate;
        return taxAmount;
    } catch (error) {
        console.error("Error calculating sales tax:", error);
        throw error;
    }
}
