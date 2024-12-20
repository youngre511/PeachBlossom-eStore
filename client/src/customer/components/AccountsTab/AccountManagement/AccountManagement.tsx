/// <reference types="vite-plugin-svgr/client" />
import React, { SetStateAction, useContext, useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccountButton from "../../../../assets/img/account.svg?react";
import "./account-management.css";
import { ExpandMoreSharp } from "@mui/icons-material";
import { AuthContext } from "../../../../common/contexts/authContext";
import PeachButton from "../../../../common/components/PeachButton";
import Security from "../Security/Security";

interface Props {
    accountsTabVisible: boolean;
    setAccountsTabVisible: React.Dispatch<SetStateAction<boolean>>;
}
const AccountManagement: React.FC<Props> = ({
    accountsTabVisible,
    setAccountsTabVisible,
}) => {
    const navigate = useNavigate();
    const auth = useContext(AuthContext);
    const [logoutVisible, setLogoutVisible] = useState<boolean>(false);
    const [showSecurity, setShowSecurity] = useState<boolean>(false);
    const logOut = () => {
        auth?.logout();
    };

    useEffect(() => {
        setShowSecurity(false);
        setLogoutVisible(false);
    }, [accountsTabVisible]);

    useEffect(() => {
        if (showSecurity) {
            setLogoutVisible(false);
        }
    }, [showSecurity]);

    return (
        <div className="account-management">
            <div className="user-greeting">
                {" "}
                <div className="account-icon">
                    <AccountButton />
                </div>{" "}
                <div
                    className="user-greeting-text"
                    onClick={() => setLogoutVisible(!logoutVisible)}
                >
                    Hello,
                    {auth &&
                        auth.user &&
                        ` ${
                            auth.user.firstName
                                ? auth.user.firstName
                                : auth.user.username
                        }`}
                    <ExpandMoreSharp sx={{ marginTop: "3.5px" }} />
                </div>
            </div>
            <div className="account-menu-content">
                <h1>Your Account</h1>
                <div className="options">
                    <ul>
                        <li
                            role="button"
                            onClick={() => {
                                navigate("/orders");
                                setAccountsTabVisible(false);
                            }}
                        >
                            Your Orders
                        </li>
                        <li>Your Addresses</li>
                        <li onClick={() => setShowSecurity(true)}>
                            Login & Security
                        </li>
                    </ul>
                </div>
            </div>
            <div
                className="customer-logout"
                style={
                    logoutVisible
                        ? undefined
                        : { transform: "translateY(100px)" }
                }
            >
                <PeachButton text="log out" width="300px" onClick={logOut} />
            </div>
            {showSecurity && <Security setShowSecurity={setShowSecurity} />}
        </div>
    );
};
export default AccountManagement;
