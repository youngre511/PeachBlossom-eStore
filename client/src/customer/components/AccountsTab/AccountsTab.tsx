import React, { SetStateAction, useContext, useEffect, useState } from "react";
import "./accounts-tab.css";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import { IconButton } from "@mui/material";
import { AuthContext } from "../../../common/contexts/authContext";
import Login from "../LogIn/Login";
import Signup from "../SignUp/Signup";

interface Props {
    setAccountsTabVisible: React.Dispatch<SetStateAction<boolean>>;
    accountsTabVisible: boolean;
}
const AccountsTab: React.FC<Props> = ({
    setAccountsTabVisible,
    accountsTabVisible,
}) => {
    const auth = useContext(AuthContext);
    const [creating, setCreating] = useState<boolean>(false);
    const [loggedIn, setLoggedIn] = useState<boolean>(false);

    useEffect(() => {}, [auth]);

    return (
        <div
            className="customer-accounts"
            style={
                accountsTabVisible
                    ? { transform: "translateX(0)", display: "flex" }
                    : undefined
            }
        >
            <div className="close-accounts-tab-btn">
                <IconButton onClick={() => setAccountsTabVisible(false)}>
                    <CloseSharpIcon />
                </IconButton>
            </div>
            {auth && auth.user && !auth.isTokenExpired() && (
                <div>Customer accounts are not yet supported.</div>
            )}
            {(!auth || !auth.user || auth.isTokenExpired()) && !creating && (
                <Login setCreating={setCreating} />
            )}
            {(!auth || !auth.user || auth.isTokenExpired()) && creating && (
                <Signup setCreating={setCreating} />
            )}
        </div>
    );
};
export default AccountsTab;
