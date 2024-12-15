import React, {
    FormEvent,
    SetStateAction,
    useContext,
    useEffect,
    useState,
} from "react";
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
    const loggedIn = auth && auth.user && !auth.isTokenExpired();

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
            {loggedIn && <div>Customer accounts are not yet supported.</div>}
            {!loggedIn && !creating && (
                <Login
                    setCreating={setCreating}
                    accountsTabVisible={accountsTabVisible}
                />
            )}
            {!loggedIn && creating && <Signup setCreating={setCreating} />}
        </div>
    );
};
export default AccountsTab;
