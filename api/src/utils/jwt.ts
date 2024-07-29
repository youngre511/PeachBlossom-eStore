import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string;

interface UserPayload {
    username: string;
    role: "customer" | "admin";
    customer_id?: number;
    admin_id?: number;
    accessLevel?: "full" | "limited" | "view only";
}

export const generateToken = (payload: object) => {
    return jwt.sign(payload, secret, { expiresIn: "1h" });
};

export const verifyToken = (token: string): UserPayload | undefined => {
    try {
        const decoded = jwt.verify(token, secret) as UserPayload;
        return decoded;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};
