import React from "react";
import { useEffect } from "react";
import ChangeCustomerPassword from "./ChangeCustomerPassword";
import "./security.css";
import ChangeCustomerEmail from "./ChangeCustomerEmail";

interface SecurityProps {}
const Security: React.FC<SecurityProps> = () => {
    return (
        <div className="security">
            <div className="security-content">
                <h1>Login & Security</h1>
                <ChangeCustomerEmail />
                <ChangeCustomerPassword />
            </div>
        </div>
    );
};
export default Security;
