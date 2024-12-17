import React, { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../contexts/authContext";
import { LinearProgress } from "@mui/material";

interface ProtectedRouteProps {
    component: React.ComponentType<any>;
    requiredRole?: "customer" | "admin";
    minimumAccessLevel?: "full" | "limited" | "view only";
    [key: string]: any;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    component: Component,
    requiredRole,
    minimumAccessLevel,
    ...rest
}) => {
    const authContext = useContext(AuthContext);
    const [isLoadingAuthorization, setIsLoadingAuthorization] =
        useState<boolean>(true);

    const permittedAccessLevels: Array<"full" | "limited" | "view only"> = [
        "full",
    ];
    if (minimumAccessLevel && minimumAccessLevel !== "full") {
        permittedAccessLevels.push("limited");
        if (minimumAccessLevel === "view only") {
            permittedAccessLevels.push("view only");
        }
    }

    useEffect(() => {
        const checkAuthentication = async () => {
            if (
                authContext &&
                (!authContext.user || authContext.isTokenExpired())
            ) {
                await authContext.requestAccessTokenRefresh();
                if (authContext.user) {
                    setIsLoadingAuthorization(false);
                }
            } else {
                setIsLoadingAuthorization(false);
            }
        };
        checkAuthentication();
    }, [authContext]);

    if (isLoadingAuthorization) {
        return (
            <div
                style={{
                    width: "100vw",
                    height: "100vh",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <LinearProgress />
            </div>
        );
    }

    if (!authContext || !authContext.user || authContext.isTokenExpired()) {
        // If the user is not logged in, redirect to the login page
        return <Navigate to="/login" />;
    }

    if (
        authContext.user.defaultPassword &&
        !window.location.pathname.includes("reset")
    ) {
        return <Navigate to="/account/password-reset" />;
    }

    if (requiredRole && authContext.user.role !== requiredRole) {
        // If the user does not have the required role, redirect to unauthorized page
        return <Navigate to="/unauthorized" />;
    }

    if (
        minimumAccessLevel &&
        authContext.user.accessLevel &&
        !permittedAccessLevels.includes(authContext.user.accessLevel)
    ) {
        // If the user does not have the required access level, redirect to unauthorized page
        return <Navigate to="/unauthorized" />;
    }

    // Render the protected component
    return <Component {...rest} />;
};

export default ProtectedRoute;
