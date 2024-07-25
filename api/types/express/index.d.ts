declare namespace Express {
    export interface Request {
        user?: {
            user_id: number;
            role: "customer" | "admin";
            customer_id?: number;
            admin_id?: number;
        };
    }
}
