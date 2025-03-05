import React, {
    ChangeEvent,
    FocusEvent,
    FormEvent,
    lazy,
    Suspense,
    useContext,
    useState,
} from "react";
import { useEffect } from "react";
import ChangeUserData from "./ChangeUserData";
import { FormControl, FormLabel, TextField } from "@mui/material";
import { AuthContext } from "../../../../common/contexts/authContext";
const PasswordStrengthBar = lazy(() => import("react-password-strength-bar"));

interface ChangeCustomerPasswordProps {}
const ChangeCustomerPassword: React.FC<ChangeCustomerPasswordProps> = () => {
    const auth = useContext(AuthContext);
    const [changeError, setChangeError] = useState<string | null>(null);
    const [formData, setFormData] = useState<{
        currentPass: string;
        newPass: string;
        confirmPass: string;
    }>({ currentPass: "", newPass: "", confirmPass: "" });

    const [changing, setChanging] = useState<boolean>(false);
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(
        null
    );

    const clearData = () => {
        setFormData({ currentPass: "", newPass: "", confirmPass: "" });
    };

    const saveData = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (validatePassword() && passwordsMatch()) {
            if (auth) {
                auth.changePassword(formData.currentPass, formData.newPass);
            }
        }
        clearData();
    };

    const validatePassword = (): boolean => {
        if (formData.newPass.length >= 8) {
            setPasswordError(false);
            setPasswordErrorMsg("");
            return true;
        } else {
            setPasswordError(true);
            setPasswordErrorMsg("Password must be at least 8 characters long.");
            return false;
        }
    };

    const passwordsMatch = (): boolean => {
        if (formData.newPass === formData.confirmPass) {
            setPasswordError(false);
            setPasswordErrorMsg("");
            return true;
        } else {
            setPasswordError(true);
            setPasswordErrorMsg("Passwords do not match. Please try again.");
            return false;
        }
    };

    useEffect(() => {
        if (auth && auth.error) {
            setChangeError(auth.error);
        } else {
            setChangeError(null);
        }
    }, [auth]);

    const handleCurrentPassChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({
            ...prevData,
            currentPass: e.target.value,
        }));
    };

    const handleNewPassChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({ ...prevData, newPass: e.target.value }));
    };

    const handleConfirmPassChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({
            ...prevData,
            confirmPass: e.target.value,
        }));
    };

    const handleNewPassBlur = (e: FocusEvent<HTMLInputElement>) => {
        validatePassword();
        if (formData.confirmPass.length > 0) {
            passwordsMatch();
        }
    };

    const handleConfirmPassBlur = (e: FocusEvent<HTMLInputElement>) => {
        passwordsMatch();
    };

    return (
        <ChangeUserData
            clearData={clearData}
            saveData={saveData}
            changing={changing}
            setChanging={setChanging}
            dataType="password"
            openHeight="360px"
            errorMsg={changeError}
        >
            <React.Fragment>
                <FormControl
                    className="change-password-field"
                    sx={{ marginBottom: "10px" }}
                >
                    <FormLabel htmlFor="current-password">
                        Current Password
                    </FormLabel>
                    <TextField
                        id="current-password"
                        type="password"
                        name="current-password"
                        value={formData.currentPass}
                        onChange={handleCurrentPassChange}
                        placeholder="••••••••"
                        autoComplete="off"
                        autoFocus
                        required
                        fullWidth
                        variant="outlined"
                    />
                </FormControl>
                <FormControl sx={{ marginBottom: 0 }}>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <TextField
                        error={passwordError}
                        helperText={passwordErrorMsg}
                        id="password"
                        type="password"
                        name="password"
                        value={formData.newPass}
                        onChange={handleNewPassChange}
                        onBlur={handleNewPassBlur}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        fullWidth
                        variant="outlined"
                        color={passwordError ? "error" : "primary"}
                    />
                    <Suspense fallback={<div>Loading password checker...</div>}>
                        <PasswordStrengthBar
                            password={formData.newPass}
                            minLength={8}
                        />
                    </Suspense>
                </FormControl>
                <FormControl sx={{ marginBottom: "10px" }}>
                    <FormLabel htmlFor="confirm-password">
                        Confirm Password
                    </FormLabel>
                    <TextField
                        error={passwordError && formData.confirmPass.length > 0}
                        id="confirm-password"
                        type="password"
                        name="confirm-password"
                        value={formData.confirmPass}
                        onChange={handleConfirmPassChange}
                        onBlur={handleConfirmPassBlur}
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        fullWidth
                        variant="outlined"
                        color={passwordError ? "error" : "primary"}
                    />
                </FormControl>
            </React.Fragment>
        </ChangeUserData>
    );
};
export default ChangeCustomerPassword;
