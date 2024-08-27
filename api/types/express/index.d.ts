declare namespace Express {
    export interface Request {
        user?: {
            username: string;
            role: "customer" | "admin";
            customer_id?: number;
            admin_id?: number;
            accessLevel?: "full" | "limited" | "view only";
        };
        refreshToken?: {
            user_id: number;
            jti: string;
            iat: number;
        };
    }
}
