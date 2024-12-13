import { FormControl, FormLabel, TextField } from "@mui/material";
import React, { SetStateAction, useState } from "react";
import { useEffect } from "react";
import PeachButton from "../../../common/components/PeachButton";
import "./login.css";

interface Props {
    setCreating: React.Dispatch<SetStateAction<boolean>>;
}
const Login: React.FC<Props> = ({ setCreating }) => {
    const [emailError, setEmailError] = useState<boolean>(false);
    const [emailErrorMsg, setEmailErrorMsg] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(
        null
    );

    return (
        <div className="login">
            <div className="login-box">
                <h1>Sign in</h1>
                <form onSubmit={() => {}} className="login-form">
                    <FormControl
                        className="login-field"
                        sx={{ marginBottom: "30px" }}
                    >
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <TextField
                            error={emailError}
                            helperText={emailErrorMsg}
                            id="email"
                            type="email"
                            name="email"
                            placeholder="your@email.com"
                            autoComplete="email"
                            autoFocus
                            required
                            fullWidth
                            variant="outlined"
                            color={emailError ? "error" : "primary"}
                        />
                    </FormControl>
                    <FormControl
                        className="login-field"
                        sx={{ marginBottom: "30px" }}
                    >
                        <div className="password-label">
                            <FormLabel htmlFor="password">Password</FormLabel>
                            <div className="forgot-btn" role="button">
                                Forgot your password?
                            </div>
                        </div>
                        <TextField
                            error={passwordError}
                            helperText={passwordErrorMsg}
                            id="password"
                            type="password"
                            name="password"
                            placeholder="••••••"
                            autoComplete="current-password"
                            autoFocus
                            required
                            fullWidth
                            variant="outlined"
                            color={passwordError ? "error" : "primary"}
                        />
                    </FormControl>
                    <FormControl
                        className="login-field"
                        sx={{ marginBottom: "30px" }}
                    >
                        <div className="password-label">
                            <FormLabel htmlFor="password">Password</FormLabel>
                            <div className="forgot-btn" role="button">
                                Forgot your password?
                            </div>
                        </div>
                        <TextField
                            error={passwordError}
                            helperText={passwordErrorMsg}
                            id="password"
                            type="password"
                            name="password"
                            placeholder="••••••"
                            autoComplete="current-password"
                            autoFocus
                            required
                            fullWidth
                            variant="outlined"
                            color={passwordError ? "error" : "primary"}
                        />
                    </FormControl>
                    <PeachButton
                        text="Sign in"
                        type="submit"
                        width="100%"
                        onClick={() => {}}
                    />
                    <div className="no-account">
                        New customer?{" "}
                        <span
                            className="sign-up-btn"
                            role="button"
                            onClick={() => setCreating(true)}
                        >
                            Create an account.
                        </span>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default Login;
