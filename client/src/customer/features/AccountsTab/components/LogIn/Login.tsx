import { FormControl, FormLabel, TextField } from "@mui/material";
import React, {
    ChangeEvent,
    FocusEvent,
    FormEvent,
    SetStateAction,
    useContext,
    useState,
} from "react";
import { useEffect } from "react";
import GoldButton from "../../../../../common/components/GoldButton";
import "./login.css";
import { AuthContext } from "../../../../../common/contexts/authContext";
import { useAppSelector } from "../../../../hooks/reduxHooks";
import { RootState } from "../../../../store/customerStore";

interface Props {
    setCreating: React.Dispatch<SetStateAction<boolean>>;
    accountsTabVisible: boolean;
}
const Login: React.FC<Props> = ({ setCreating, accountsTabVisible }) => {
    const auth = useContext(AuthContext);
    const cart = useAppSelector((state: RootState) => state.cart);

    const [emailError, setEmailError] = useState<boolean>(false);
    const [emailErrorMsg, setEmailErrorMsg] = useState<string | null>(null);

    const [loginError, setLoginError] = useState<string | null>(null);

    const [formData, setFormData] = useState<{
        email: string;
        password: string;
    }>({ email: "", password: "" });

    const logIn = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (auth) {
            if (cart.cartId) {
                auth.login(
                    formData.email,
                    formData.password,
                    "customer",
                    cart.cartId
                );
            } else {
                auth.login(formData.email, formData.password, "customer");
            }
        }
    };

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({ ...prevData, email: e.target.value }));
    };

    const handlePasswordChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({ ...prevData, password: e.target.value }));
    };

    useEffect(() => {
        if (!accountsTabVisible) {
            setFormData({ email: "", password: "" });
            setEmailError(false);
            setEmailErrorMsg(null);
        }
    }, [accountsTabVisible]);

    const handleEmailBlur = (e: FocusEvent<HTMLInputElement>) => {
        if (
            formData.email.length > 0 &&
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

    useEffect(() => {
        if (auth && auth.error) {
            setLoginError(auth.error);
        }
    }, [auth]);

    return (
        <div className="login">
            <div className="login-box">
                <h1>Sign in</h1>
                {loginError && (
                    <div className="login-error-msg">{loginError}</div>
                )}
                <form onSubmit={logIn} className="login-form">
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
                            value={formData.email}
                            onChange={handleEmailChange}
                            onBlur={handleEmailBlur}
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
                            id="password"
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handlePasswordChange}
                            autoComplete="current-password"
                            required
                            fullWidth
                            variant="outlined"
                        />
                    </FormControl>

                    <GoldButton
                        className="login-btn"
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
