import { FormControl, FormLabel, TextField } from "@mui/material";
import React, {
    ChangeEvent,
    FocusEvent,
    FormEvent,
    SetStateAction,
    useContext,
    useState,
} from "react";
import { useEffect, lazy, Suspense } from "react";
import PeachButton from "../../../../../common/components/PeachButton";
import "./signup.css";
import {
    AuthContext,
    CreateAccountData,
} from "../../../../../common/contexts/authContext";
const PasswordStrengthBar = lazy(() => import("react-password-strength-bar"));

interface Props {
    setCreating: React.Dispatch<SetStateAction<boolean>>;
    accountsTabVisible: boolean;
}
const Signup: React.FC<Props> = ({ setCreating, accountsTabVisible }) => {
    const [emailError, setEmailError] = useState<boolean>(false);
    const [emailErrorMsg, setEmailErrorMsg] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(
        null
    );
    const [signupError, setSignupError] = useState<string | null>(null);

    const auth = useContext(AuthContext);

    const [formData, setFormData] = useState<{
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        confirmPassword: string;
    }>({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const signUp = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (validatePassword() && passwordsMatch()) {
            const data: CreateAccountData = {
                username: formData.email,
                email: formData.email,
                password: formData.password,
                role: "customer",
                defaultPassword: false,
                firstName: formData.firstName,
                lastName: formData.lastName,
            };

            if (auth) {
                auth.createAccount(data);
            }
        }
    };

    const validatePassword = (): boolean => {
        if (formData.password.length >= 8) {
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
        if (formData.password === formData.confirmPassword) {
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
        if (!accountsTabVisible) {
            setFormData({
                firstName: "",
                lastName: "",
                email: "",
                password: "",
                confirmPassword: "",
            });
            setEmailError(false);
            setEmailErrorMsg(null);
        }
    }, [accountsTabVisible]);

    useEffect(() => {
        if (auth && auth.error) {
            setSignupError(auth.error);
        } else {
            setSignupError(null);
        }
    }, [auth]);

    const handleFNChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({ ...prevData, firstName: e.target.value }));
    };

    const handleLNChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({ ...prevData, lastName: e.target.value }));
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({ ...prevData, email: e.target.value }));
    };

    const handleEmailBlur = (e: FocusEvent<HTMLInputElement>) => {
        if (
            !/^(?=.{1,64}@.{1,255}$)(?=.{6,})[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                formData.email
            )
        ) {
            setEmailError(true);
            setEmailErrorMsg("Please enter a valid email address.");
        } else {
            setEmailError(false);
            setEmailErrorMsg(null);
        }
    };

    const handlePasswordBlur = (e: FocusEvent<HTMLInputElement>) => {
        validatePassword();
        if (formData.confirmPassword.length > 0) {
            passwordsMatch();
        }
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({ ...prevData, password: e.target.value }));
    };

    const handleConfirmBlur = (e: FocusEvent<HTMLInputElement>) => {
        passwordsMatch();
    };

    const handleConfirmChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({
            ...prevData,
            confirmPassword: e.target.value,
        }));
    };

    return (
        <div className="signup">
            <div className="signup-box">
                <h1>Create account</h1>
                {signupError && (
                    <div className="signup-error">{signupError}</div>
                )}
                <form onSubmit={signUp} className="signup-form">
                    <div className="signup-name">
                        <FormControl sx={{ marginBottom: "30px", flexGrow: 1 }}>
                            <FormLabel htmlFor="firstName">
                                First Name
                            </FormLabel>
                            <TextField
                                id="firstName"
                                type="name"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleFNChange}
                                placeholder="Jon"
                                autoComplete="given-name"
                                autoFocus
                                required
                                fullWidth
                                variant="outlined"
                            />
                        </FormControl>
                        <FormControl sx={{ marginBottom: "30px", flexGrow: 1 }}>
                            <FormLabel htmlFor="lastName">Last Name</FormLabel>
                            <TextField
                                id="lastName"
                                type="name"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleLNChange}
                                placeholder="Snow"
                                autoComplete="family-name"
                                required
                                fullWidth
                                variant="outlined"
                            />
                        </FormControl>
                    </div>
                    <FormControl sx={{ marginBottom: "30px" }}>
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <TextField
                            error={emailError}
                            helperText={emailErrorMsg}
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleEmailChange}
                            onBlur={handleEmailBlur}
                            placeholder="your@email.com"
                            autoComplete="email"
                            required
                            fullWidth
                            variant="outlined"
                            color={emailError ? "error" : "primary"}
                        />
                    </FormControl>
                    <FormControl sx={{ marginBottom: "30px" }}>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <TextField
                            error={passwordError}
                            helperText={passwordErrorMsg}
                            id="password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handlePasswordChange}
                            onBlur={handlePasswordBlur}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                            fullWidth
                            variant="outlined"
                            color={passwordError ? "error" : "primary"}
                        />
                        <Suspense
                            fallback={<div>Loading password checker...</div>}
                        >
                            <PasswordStrengthBar
                                password={formData.password}
                                minLength={8}
                            />
                        </Suspense>
                    </FormControl>
                    <FormControl sx={{ marginBottom: "30px" }}>
                        <FormLabel htmlFor="confirm-password">
                            Confirm Password
                        </FormLabel>
                        <TextField
                            error={
                                passwordError &&
                                formData.confirmPassword.length > 0
                            }
                            id="confirm-password"
                            type="password"
                            name="confirm-password"
                            value={formData.confirmPassword}
                            onChange={handleConfirmChange}
                            onBlur={handleConfirmBlur}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            required
                            fullWidth
                            variant="outlined"
                            color={passwordError ? "error" : "primary"}
                        />
                    </FormControl>
                    <PeachButton
                        text="Create Account"
                        type="submit"
                        width="100%"
                        onClick={() => {}}
                    />
                    <div className="have-account">
                        Already have an account?{" "}
                        <span
                            className="sign-in-btn"
                            role="button"
                            onClick={() => setCreating(false)}
                        >
                            Sign in.
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default Signup;
