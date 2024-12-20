/// <reference types="vite-plugin-svgr/client" />
import React, { SetStateAction } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AccountButton from "../../../../assets/img/account.svg?react";
import "./account-management.css";
import { ExpandMoreSharp } from "@mui/icons-material";

interface Props {
    accountsTabVisible: boolean;
    setAccountsTabVisible: React.Dispatch<SetStateAction<boolean>>;
}
const AccountManagement: React.FC<Props> = ({
    accountsTabVisible,
    setAccountsTabVisible,
}) => {
    const navigate = useNavigate();

    return (
        <div className="account-management">
            <div className="user-greeting">
                {" "}
                <div className="account-icon">
                    <AccountButton />
                </div>{" "}
                <div className="user-greeting-text">
                    Hello, Ryan
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
                        <li>Login & Security</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
export default AccountManagement;
