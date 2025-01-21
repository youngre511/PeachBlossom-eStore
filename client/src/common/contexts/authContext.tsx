import React, {
    createContext,
    useState,
    useEffect,
    ReactNode,
    useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { jwtDecode } from "jwt-decode";

interface IUserToken {
    username: string;
    role: "customer" | "admin";
    cart_id?: number;
    firstName?: string;
    lastName?: string;
    accessLevel?: "full" | "limited" | "view only";
    exp: number;
    defaultPassword: boolean;
}

export interface CreateAccountData {
    username: string;
    password: string;
    role: "customer" | "admin";
    accessLevel?: "full" | "limited";
    email?: string;
    defaultPassword?: boolean;
    firstName?: string;
    lastName?: string;
}

interface AuthContextProps {
    user: IUserToken | undefined;
    cartId: number | null;
    login: (
        username: string,
        password: string,
        role: "customer" | "admin",
        cartId?: number
    ) => void;
    logout: () => void;
    clearAuthCart: () => void;
    createAccount: (data: CreateAccountData) => Promise<void>;
    isTokenExpired: () => boolean;
    requestAccessTokenRefresh: () => void;
    changePassword: (
        oldPassword: string,
        newPassword: string
    ) => Promise<string | undefined>;
    changeUsername: (
        newUsername: string,
        password: string
    ) => Promise<string | undefined>;
    changeDisplayName: (
        firstName: string,
        lastName: string,
        password: string
    ) => Promise<string | undefined>;
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
    const [cartId, setCartId] = useState<number | null>(null);
    const navigate = useNavigate();
    const [error, setError] = useState<string>("");
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [loggingOut, setLoggingOut] = useState<boolean>(false);
    const location = useLocation();
    const [madeInitialCheck, setMadeInitialCheck] = useState<boolean>(false);

    // Check for an access token, and if it exists, store its data in "user" state.
    useEffect(() => {
        const token = localStorage.getItem("jwtToken");
        if (token) {
            try {
                const decoded = jwtDecode<IUserToken>(token);
                if (decoded.exp * 1000 > Date.now()) {
                    setUser(decoded);
                } else {
                    logout();
                }
            } catch (e) {
                console.error("Failed to decode token", e);
            }
        }
    }, []);

    // Request new access token
    const requestAccessTokenRefresh = useCallback(async () => {
        if (location.pathname === "/login" || loggingOut) {
            return;
        }

        try {
            // Send api request only if there is no current access token and attempt to refresh has not already been made in the absence of said token, if the token has no expiration date, or if the expiration date is not more than 15 minutes in the future.
            const accessToken = localStorage.getItem("jwtToken");
            let proceed: boolean = false;
            if (!accessToken) {
                console.log("no access token");
                if (!madeInitialCheck) {
                    proceed = true;
                    setMadeInitialCheck(true);
                } else if (
                    window.location.hostname.startsWith("admin") &&
                    location.pathname !== "/login"
                ) {
                    navigate("/login");
                }
            } else {
                const decoded = jwtDecode<IUserToken>(accessToken);
                if (!decoded.exp) {
                    proceed = true;
                } else {
                    const expirationTime = decoded.exp * 1000;
                    const currentTime = Date.now();
                    const timeToCompare = currentTime + 1 + 15 * 60 * 1000;
                    if (timeToCompare >= expirationTime) {
                        proceed = true;
                    }
                }
            }
            if (proceed && !isRefreshing) {
                console.log("proceeding");
                setIsRefreshing(true);
                const response = await axios.post(
                    `${import.meta.env.VITE_API_URL}/auth/refresh-access-token`,
                    {},
                    {
                        withCredentials: true,
                    }
                );
                const { newAccessToken } = response.data;
                const decodedToken = jwtDecode<IUserToken>(newAccessToken);
                if (!decodedToken) {
                    throw new Error("Failed to decode new token");
                }
                if (!decodedToken.exp) {
                    throw new Error(
                        "New token does not have an expiration date"
                    );
                }
                const newExpirationTime = decodedToken.exp * 1000;

                localStorage.setItem("jwtToken", newAccessToken);
                localStorage.setItem(
                    "jwtExpiration",
                    newExpirationTime.toString()
                );
                setUser(decodedToken);
            }
        } catch (error) {
            if (error instanceof AxiosError) {
                if (error.response && error.response.status === 401) {
                    console.error("Refresh token is invalid or expired");
                } else {
                    console.error(
                        error.response
                            ? error.response.data.message
                            : error.message
                    );
                }
            } else {
                console.error("An unknown error occurred");
            }
            if (isTokenExpired()) {
                setUser(undefined);
                localStorage.removeItem("jwtToken");
                localStorage.removeItem("jwtExpiration");
                if (window.location.hostname.startsWith("admin"))
                    navigate("/login");
            }
        } finally {
            setIsRefreshing(false);
        }
    }, [location, isRefreshing, loggingOut, madeInitialCheck]);

    useEffect(() => {
        // Refresh access token every 30 minutes
        const intervalId = setInterval(() => {
            requestAccessTokenRefresh();
        }, 15 * 60 * 1000);

        const handleUserActivity = (event: MouseEvent | KeyboardEvent) => {
            // Check if the click is on the logout button
            const isLogoutButton =
                event.target instanceof Element &&
                event.target.closest("#logout");
            if (isLogoutButton) {
                console.log("that it is");
                return;
            }
            requestAccessTokenRefresh();
        };

        if (window.location.hostname.startsWith("admin")) {
            window.addEventListener("mousemove", handleUserActivity);
            window.addEventListener("click", handleUserActivity);
            window.addEventListener("keydown", handleUserActivity);
        }

        return () => {
            clearInterval(intervalId);
            window.removeEventListener("mousemove", handleUserActivity);
            window.removeEventListener("click", handleUserActivity);
            window.removeEventListener("keydown", handleUserActivity);
        };
    }, [requestAccessTokenRefresh]);

    const isTokenExpired = useCallback((): boolean => {
        try {
            const token = localStorage.getItem("jwtToken");
            if (!token) {
                return true;
            }
            const decoded = jwtDecode<IUserToken>(token);
            if (!decoded.exp) {
                return true;
            }
            const expirationTime = decoded.exp * 1000;
            return Date.now() > expirationTime;
        } catch (e) {
            console.error("Failed to decode token", e);
            return true;
        }
    }, []);

    const createAccount = async (data: CreateAccountData) => {
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/register`,
                data,
                { withCredentials: true }
            );

            const { accessToken } = response.data;
            const decodedToken = jwtDecode<IUserToken>(accessToken);
            if (!decodedToken.exp) {
                throw new Error("Token does not have an expiration date");
            }
            const expirationTime = decodedToken.exp * 1000;

            localStorage.setItem("jwtToken", accessToken);
            localStorage.setItem("jwtExpiration", expirationTime.toString());

            setUser(decodedToken);
            setMadeInitialCheck(false);
            if (user && user.role === "admin") {
                navigate("/");
            }
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

    const login = async (
        username: string,
        password: string,
        role: "customer" | "admin",
        cartId?: number
    ) => {
        setError("");
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/auth/${
                    role === "admin" ? "admin/" : ""
                }login`,
                { username, password, cartId: cartId ? cartId : undefined },
                { withCredentials: true }
            );

            const { accessToken, newCartId } = response.data;
            const decodedToken = jwtDecode<IUserToken>(accessToken);
            if (!decodedToken.exp) {
                throw new Error("Token does not have an expiration date");
            }
            const expirationTime = decodedToken.exp * 1000;

            localStorage.setItem("jwtToken", accessToken);
            localStorage.setItem("jwtExpiration", expirationTime.toString());

            setUser(decodedToken);
            setMadeInitialCheck(false);
            if (user && user.role === "admin") {
                navigate("/");
            }

            setCartId(newCartId);
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

    const logout = async () => {
        setError("");
        setLoggingOut(true);
        localStorage.removeItem("jwtToken");
        localStorage.removeItem("jwtExpiration");
        setUser(undefined);
        setCartId(null);
        try {
            await axios.put(
                `${import.meta.env.VITE_API_URL}/auth/revoke-refresh-token`,
                {},
                {
                    withCredentials: true,
                }
            );
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error(error.message);
            } else {
                console.error(
                    "An unknown error occurred while requesting refresh token revocation"
                );
            }
        }
        setLoggingOut(false);
        if (window.location.hostname.startsWith("admin")) navigate("/login"); // Redirect to the login page
    };

    const clearAuthCart = () => {
        setCartId(null);
    };

    const changePassword = async (
        oldPassword: string,
        newPassword: string
    ): Promise<string | undefined> => {
        const token = localStorage.getItem("jwtToken");
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/user/changePassword`,
                {
                    oldPassword,
                    newPassword,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                    withCredentials: true,
                }
            );

            console.log("changeResponse:", response);

            const { accessToken } = response.data;
            const decodedToken = jwtDecode<IUserToken>(accessToken);
            if (!decodedToken.exp) {
                throw new Error("Token does not have an expiration date");
            }
            const expirationTime = decodedToken.exp * 1000;

            localStorage.setItem("jwtToken", accessToken);
            localStorage.setItem("jwtExpiration", expirationTime.toString());

            setUser(decodedToken);
            return "Success";
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error(error.message);
                if (error.status === 404) {
                    return "Invalid";
                }
            } else {
                console.error(
                    "An unknown error occurred while attempting to change password"
                );
                return "An unknown error occurred while attempting to change password";
            }
        }
    };

    const changeUsername = async (
        newUsername: string,
        password: string
    ): Promise<string | undefined> => {
        const token = localStorage.getItem("jwtToken");
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/user/changeUsername`,
                {
                    newUsername,
                    password,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                    withCredentials: true,
                }
            );

            console.log("changeResponse:", response);

            const { accessToken } = response.data;
            const decodedToken = jwtDecode<IUserToken>(accessToken);
            if (!decodedToken.exp) {
                throw new Error("Token does not have an expiration date");
            }
            const expirationTime = decodedToken.exp * 1000;

            localStorage.setItem("jwtToken", accessToken);
            localStorage.setItem("jwtExpiration", expirationTime.toString());

            setUser(decodedToken);
            return "Success";
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error(error.message);
                if (error.status === 404) {
                    return "Invalid";
                }
            } else {
                console.error(
                    "An unknown error occurred while attempting to change email"
                );
                return "An unknown error occurred while attempting to change email";
            }
        }
    };

    const changeDisplayName = async (
        firstName: string,
        lastName: string,
        password: string
    ): Promise<string | undefined> => {
        const token = localStorage.getItem("jwtToken");
        try {
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/user/changeDisplayName`,
                {
                    newFirstName: firstName,
                    newLastName: lastName,
                    password,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                    withCredentials: true,
                }
            );

            console.log("changeResponse:", response);

            const { accessToken } = response.data;
            const decodedToken = jwtDecode<IUserToken>(accessToken);
            if (!decodedToken.exp) {
                throw new Error("Token does not have an expiration date");
            }
            const expirationTime = decodedToken.exp * 1000;

            localStorage.setItem("jwtToken", accessToken);
            localStorage.setItem("jwtExpiration", expirationTime.toString());

            setUser(decodedToken);
            return "Success";
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error(error.message);
                if (error.status === 404) {
                    return "Invalid";
                }
            } else {
                console.error(
                    "An unknown error occurred while attempting to change display name"
                );
                return "An unknown error occurred while attempting to change display name";
            }
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                cartId,
                createAccount,
                login,
                logout,
                clearAuthCart,
                isTokenExpired,
                requestAccessTokenRefresh,
                changePassword,
                changeUsername,
                changeDisplayName,
                error,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
