import { FormControl, FormLabel, TextField } from "@mui/material";
import React, { SetStateAction, useState } from "react";
import { useEffect } from "react";
import PeachButton from "../../../common/components/PeachButton";
import "./signup.css";

interface Props {
    setCreating: React.Dispatch<SetStateAction<boolean>>;
}
const Signup: React.FC<Props> = ({ setCreating }) => {
    const [emailError, setEmailError] = useState<boolean>(false);
    const [emailErrorMsg, setEmailErrorMsg] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<boolean>(false);
    const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(
        null
    );

    return (
        <div className="signup">
            <div className="signup-box">
                <h1>Create account</h1>
                <form onSubmit={() => {}} className="signup-form">
                    <FormControl sx={{ marginBottom: "30px" }}>
                        <FormLabel htmlFor="name">Full Name</FormLabel>
                        <TextField
                            error={emailError}
                            helperText={emailErrorMsg}
                            id="name"
                            type="name"
                            name="name"
                            placeholder="Jon Snow"
                            autoComplete="name"
                            autoFocus
                            required
                            fullWidth
                            variant="outlined"
                            color={emailError ? "error" : "primary"}
                        />
                    </FormControl>
                    <FormControl sx={{ marginBottom: "30px" }}>
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
                    <FormControl sx={{ marginBottom: "30px" }}>
                        <FormLabel htmlFor="password">Password</FormLabel>
                        <TextField
                            error={passwordError}
                            helperText={passwordErrorMsg}
                            id="password"
                            type="password"
                            name="password"
                            placeholder="••••••"
                            autoComplete="off"
                            autoFocus
                            required
                            fullWidth
                            variant="outlined"
                            color={passwordError ? "error" : "primary"}
                        />
                    </FormControl>
                    <FormControl sx={{ marginBottom: "30px" }}>
                        <FormLabel htmlFor="confirm-password">
                            Confirm Password
                        </FormLabel>
                        <TextField
                            error={passwordError}
                            helperText={passwordErrorMsg}
                            id="confirm-password"
                            type="password"
                            name="confirm-password"
                            placeholder="••••••"
                            autoComplete="off"
                            autoFocus
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
                        Have and account?{" "}
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
