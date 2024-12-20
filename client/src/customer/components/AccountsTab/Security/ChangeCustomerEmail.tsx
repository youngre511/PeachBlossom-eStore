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

interface ChangeCustomerEmailProps {}
const ChangeCustomerEmail: React.FC<ChangeCustomerEmailProps> = () => {
    const auth = useContext(AuthContext);
    const [changeError, setChangeError] = useState<string | null>(null);
    const [formData, setFormData] = useState<{
        newEmail: string;
        password: string;
    }>({ newEmail: auth && auth.user ? auth.user.username : "", password: "" });

    const [changing, setChanging] = useState<boolean>(false);
    const [emailError, setEmailError] = useState<boolean>(false);
    const [emailErrorMsg, setEmailErrorMsg] = useState<string | null>(null);

    const clearData = () => {
        setFormData({
            newEmail: auth && auth.user ? auth.user.username : "",
            password: "",
        });
    };

    const saveData = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // if (auth) {
        //     auth.changePassword(formData.currentPass, formData.newPass);
        // }
    };

    useEffect(() => {
        if (auth && auth.error) {
            setChangeError(auth.error);
        } else {
            setChangeError(null);
        }
    }, [auth]);

    const handleEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({ ...prevData, newEmail: e.target.value }));
    };

    const handleEmailBlur = (e: FocusEvent<HTMLInputElement>) => {
        if (
            !/^(?=.{1,64}@.{1,255}$)(?=.{6,})[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
                formData.newEmail
            )
        ) {
            setEmailError(true);
            setEmailErrorMsg("Please enter a valid email address.");
        } else {
            setEmailError(false);
            setEmailErrorMsg(null);
        }
    };

    const handlePassChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({ ...prevData, password: e.target.value }));
    };

    return (
        <ChangeUserData
            clearData={clearData}
            saveData={saveData}
            changing={changing}
            setChanging={setChanging}
            dataType="email"
            openHeight="250px"
            errorMsg={changeError}
        >
            <React.Fragment>
                <FormControl sx={{ marginBottom: "10px" }}>
                    <FormLabel htmlFor="email">Email</FormLabel>
                    <TextField
                        error={emailError}
                        helperText={emailErrorMsg}
                        id="email"
                        type="email"
                        name="email"
                        value={formData.newEmail}
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
                <FormControl sx={{ marginBottom: 0 }}>
                    <FormLabel htmlFor="password">Password</FormLabel>
                    <TextField
                        id="password"
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handlePassChange}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        required
                        fullWidth
                        variant="outlined"
                    />
                </FormControl>
            </React.Fragment>
        </ChangeUserData>
    );
};
export default ChangeCustomerEmail;
