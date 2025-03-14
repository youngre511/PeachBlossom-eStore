import { Button, TextField } from "@mui/material";
import React, { useContext, useState } from "react";
import "./change-password.css";
import { useEffect } from "react";
import { useNavigationContext } from "../../../common/contexts/navContext";
import { AuthContext } from "../../../common/contexts/authContext";
import { useNavigate } from "react-router-dom";

interface Props {}
const ChangePassword: React.FC<Props> = () => {
    const [isChange, setIsChange] = useState<boolean>(true);
    const [oldPassword, setOldPassword] = useState<string>("");
    const [newPassword, setNewPassword] = useState<string>("");
    const [verifyPassword, setVerifyPassword] = useState<string>("");
    const [formatError, setFormatError] = useState<boolean>(false);
    const [passwordHelperText, setPasswordHelperText] = useState<string>(
        "Password must be at least 8 characters long and contain 1 number and 1 symbol."
    );
    const [matchError, setMatchError] = useState<boolean>(false);
    const [oldPasswordError, setOldPasswordError] = useState<boolean>(false);
    const [canSubmit, setCanSubmit] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const { currentRoute } = useNavigationContext();
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error(
            "Oops! Something went wrong. Unable to access authContext."
        );
    }
    const { changePassword } = authContext;

    const validatePassword = (password: string) => {
        const hasEightCharacters = password.length >= 8;
        const hasNumeral = /\d/.test(password); // Regular expression to check for at least one digit
        const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
            password
        );
        if (hasEightCharacters && hasNumeral && hasSymbol) {
            return true;
        } else {
            return false;
        }
    };

    const passwordMatch = () => newPassword === verifyPassword;

    useEffect(() => {
        if (currentRoute && currentRoute.includes("reset")) {
            if (isChange) {
                setIsChange(false);
            }
            setOldPassword("default");
        } else if (currentRoute && !isChange) {
            setIsChange(true);
        }
    }, [currentRoute]);

    const handlePasswordBlur = () => {
        const isValid = validatePassword(newPassword);
        if (!isValid && newPassword.length > 0) {
            setFormatError(true);
        } else {
            setFormatError(false);
        }
    };

    const handleVerifyBlur = () => {
        if (
            !passwordMatch() &&
            newPassword.length > 0 &&
            verifyPassword.length > 0
        ) {
            setMatchError(true);
        } else {
            setMatchError(false);
        }
    };

    useEffect(() => {
        if (formatError) {
            setPasswordHelperText(
                "Enter a valid password. Password must be at least 8 characters long and contain 1 number and 1 symbol."
            );
        } else {
            setPasswordHelperText(
                "Password must be at least 8 characters long and contain 1 number and 1 symbol."
            );
        }
    }, [formatError]);

    useEffect(() => {
        if (
            oldPassword.length > 0 &&
            validatePassword(newPassword) &&
            passwordMatch()
        ) {
            setCanSubmit(true);
        } else {
            setCanSubmit(false);
        }
    }, [oldPassword, newPassword, verifyPassword]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (canSubmit) {
            const response = await changePassword(oldPassword, newPassword);
            if (response === "Invalid") {
                setOldPasswordError(true);
            } else if (response === "Success") {
                navigate("/");
            } else {
                setErrorMessage(
                    response ||
                        "An unknown server error occurred. Please try again later."
                );
            }
        }
    };

    return (
        <div className="reset-default">
            <div className="reset-form-header">
                <h1>Choose a New Password</h1>
            </div>
            {errorMessage && <p>{errorMessage}</p>}
            <form
                className="reset-default-form"
                onSubmit={(e) => handleSubmit(e)}
            >
                {isChange && (
                    <TextField
                        label="Old Password"
                        required
                        onChange={(e) => setOldPassword(e.target.value)}
                        error={oldPasswordError}
                        helperText={
                            oldPasswordError
                                ? "Incorrect password. Please try again."
                                : ""
                        }
                    />
                )}
                <TextField
                    label={`${isChange ? "New " : ""}Password`}
                    required
                    error={formatError}
                    helperText={passwordHelperText}
                    onChange={(e) => setNewPassword(e.target.value)}
                    onBlur={handlePasswordBlur}
                />
                <TextField
                    label="Verify Password"
                    required
                    onChange={(e) => setVerifyPassword(e.target.value)}
                    error={matchError}
                    helperText={
                        matchError ? "Passwords do not match." : undefined
                    }
                    onBlur={handleVerifyBlur}
                />
                <Button variant="contained" type="submit" disabled={!canSubmit}>
                    Save
                </Button>
            </form>
        </div>
    );
};
export default ChangePassword;
