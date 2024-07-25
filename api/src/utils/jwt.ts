import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string;

interface UserPayload {
    id: number;
    role: "customer" | "admin";
    customer_id?: number;
    admin_id?: number;
}

export const generateToken = (payload: object) => {
    return jwt.sign(payload, secret, { expiresIn: "1h" });
};

export const verifyToken = (token: string): UserPayload | null => {
    try {
        const decoded = jwt.verify(token, secret) as UserPayload;
        return decoded;
    } catch (error) {
        console.error(error);
        return null;
    }
};
