import React, { createContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";

interface IUserToken {
    username: string;
    role: "customer" | "admin";
    customer_id?: number;
    admin_id?: number;
    accessLevel?: "full" | "limited" | "view only";
    exp: number;
}

interface AuthContextProps {
    user: IUserToken | undefined;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    error: string;
}

export const AuthContext = createContext<AuthContextProps | undefined>(
    undefined
);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<IUserToken | undefined>(undefined);
    const navigate = useNavigate();
    const [error, setError] = useState<string>("");

    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            try {
                const decoded = jwtDecode<IUserToken>(token);
                setUser(decoded);
            } catch (e) {
                console.error("Failed to decode token", e);
            }
        }
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/auth/login`,
                { username, password }
            );
            const { token } = response.data;
            const decodedToken = jwtDecode<IUserToken>(token);
            if (!decodedToken.exp) {
                throw new Error("Token does not have an expiration date");
            }
            const expirationTime = decodedToken.exp * 1000;

            localStorage.setItem("jwtToken", token);
            localStorage.setItem("jwtExpiration", expirationTime.toString());

            setUser(decodedToken);
            navigate("/");
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(
                    error.response ? error.response.data.message : error.message
                );
            } else {
                setError("An unknown error occurred");
            }
        }
    };

    const logout = () => {
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("jwtExpiration");
        setUser(undefined);
        navigate("/login"); // Redirect to the login page
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, error }}>
            {children}
        </AuthContext.Provider>
    );
};
