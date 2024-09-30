import React, { SetStateAction } from "react";
import "./accounts-tab.css";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import { IconButton } from "@mui/material";

interface Props {
    setAccountsTabVisible: React.Dispatch<SetStateAction<boolean>>;
    accountsTabVisible: boolean;
}
const AccountsTab: React.FC<Props> = ({
    setAccountsTabVisible,
    accountsTabVisible,
}) => {
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
            <div>Customer accounts are not yet supported.</div>
        </div>
    );
};
export default AccountsTab;
