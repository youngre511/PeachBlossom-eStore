import React, { SetStateAction, useState } from "react";
import { useEffect } from "react";
import ChangeCustomerPassword from "./ChangeCustomerPassword";
import "./security.css";
import ChangeCustomerEmail from "./ChangeCustomerEmail";
import { ChevronLeftSharp } from "@mui/icons-material";
import ChangeCustomerName from "./ChangeCustomerName";

interface SecurityProps {
    setShowSecurity: React.Dispatch<SetStateAction<boolean>>;
}
const Security: React.FC<SecurityProps> = ({ setShowSecurity }) => {
    const [securityVisible, setSecurityVisible] = useState<boolean>(false);
    const [fullyOpen, setFullyOpen] = useState<boolean>(false);

    // useEffect(() => {

    // }, []);

    useEffect(() => {
        if (!securityVisible && fullyOpen) {
            setTimeout(() => {
                setShowSecurity(false);
            }, 300);
        } else if (!securityVisible) {
            setSecurityVisible(true);
            setTimeout(() => {
                setFullyOpen(true);
            }, 300);
        }
    }, [securityVisible]);

    return (
        <div
            className="security"
            style={securityVisible ? { transform: "translateX(0)" } : undefined}
        >
            <div
                className="sec-back-btn"
                onClick={() => setSecurityVisible(false)}
            >
                <ChevronLeftSharp />
                Back
            </div>
            <div className="security-content">
                <h1>Login & Security</h1>
                <ChangeCustomerName />
                <ChangeCustomerEmail />
                <ChangeCustomerPassword />
            </div>
        </div>
    );
};
export default Security;
