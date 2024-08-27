import jwt from "jsonwebtoken";

const secret = process.env.JWT_SECRET as string;

interface UserPayload {
    username: string;
    role: "customer" | "admin";
    customer_id?: number;
    admin_id?: number;
    accessLevel?: "full" | "limited" | "view only";
}

interface RefreshTokenPayload {
    user_id: number;
    iat: number;
    jti: string;
}

export const generateToken = (payload: object, expiresIn: string) => {
    return jwt.sign(payload, secret, { expiresIn });
};

export const generateAccessToken = (payload: object) => {
    return generateToken(payload, "1h");
};

export const generateRefreshToken = (payload: object) => {
    return generateToken(payload, "7d");
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

export const verifyRefreshToken = (
    refreshToken: string
): RefreshTokenPayload | undefined => {
    try {
        const decoded = jwt.verify(refreshToken, secret) as RefreshTokenPayload;
        return decoded;
    } catch (error) {
        console.error(error);
        return undefined;
    }
};
