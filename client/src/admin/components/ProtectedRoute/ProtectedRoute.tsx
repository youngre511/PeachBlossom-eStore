import React, { useContext } from "react";
import { Navigate, RouteProps } from "react-router-dom";
import { AuthContext } from "../../../common/contexts/authContext";

interface ProtectedRouteProps {
    component: React.ComponentType<any>;
    requiredRole?: "customer" | "admin";
    requiredAccessLevel?: "full" | "limited" | "view only";
    [key: string]: any;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    component: Component,
    requiredRole,
    requiredAccessLevel,
    ...rest
}) => {
    const authContext = useContext(AuthContext);

    if (!authContext || !authContext.user) {
        // If the user is not logged in, redirect to the login page
        return <Navigate to="/login" />;
    }

    if (requiredRole && authContext.user.role !== requiredRole) {
        // If the user does not have the required role, redirect to unauthorized page
        return <Navigate to="/unauthorized" />;
    }

    if (
        requiredAccessLevel &&
        authContext.user.accessLevel !== requiredAccessLevel
    ) {
        // If the user does not have the required access level, redirect to unauthorized page
        return <Navigate to="/unauthorized" />;
    }

    // Render the protected component
    return <Component {...rest} />;
};

export default ProtectedRoute;
