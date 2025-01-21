declare namespace Express {
    export interface Request {
        user?: {
            username: string;
            role: "customer" | "admin";
            lastName?: string;
            firstName?: string;
            accessLevel?: "full" | "limited" | "view only";
            defaultPassword: boolean;
            iat?: number;
            exp?: number;
        };
        refreshToken?: {
            user_id: number;
            jti: string;
            iat: number;
        };
        trackingId?: string;
    }
}
