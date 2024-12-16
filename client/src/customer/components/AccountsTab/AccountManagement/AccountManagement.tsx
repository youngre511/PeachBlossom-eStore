import React, { SetStateAction } from "react";
import { useEffect } from "react";

interface Props {
    accountsTabVisible: boolean;
    setAccountsTabVisible: React.Dispatch<SetStateAction<boolean>>;
}
const AccountManagement: React.FC<Props> = ({
    accountsTabVisible,
    setAccountsTabVisible,
}) => {
    return (
        <div className="account-management">
            <div className="user-greeting">Hello, Ryan</div>
        </div>
    );
};
export default AccountManagement;
