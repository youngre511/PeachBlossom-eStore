import React, { ChangeEvent, FormEvent, useContext, useState } from "react";
import { useEffect } from "react";
import ChangeUserData from "./ChangeUserData";
import { FormControl, FormLabel, TextField } from "@mui/material";
import { AuthContext } from "../../../../common/contexts/authContext";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";

interface ChangeCustomerNameProps {}
const ChangeCustomerName: React.FC<ChangeCustomerNameProps> = () => {
    const auth = useContext(AuthContext);
    const [changeError, setChangeError] = useState<string | null>(null);
    const [formData, setFormData] = useState<{
        firstName: string;
        lastName: string;
        password: string;
    }>({
        firstName:
            auth && auth.user && auth.user.firstName ? auth.user.firstName : "",
        lastName:
            auth && auth.user && auth.user.lastName ? auth.user.lastName : "",
        password: "",
    });
    const { width } = useWindowSizeContext();

    const [changing, setChanging] = useState<boolean>(false);

    const clearData = () => {
        setFormData({
            firstName:
                auth && auth.user && auth.user.firstName
                    ? auth.user.firstName
                    : "",
            lastName:
                auth && auth.user && auth.user.lastName
                    ? auth.user.lastName
                    : "",
            password: "",
        });
    };

    const saveData = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (auth) {
            auth.changeDisplayName(
                formData.firstName,
                formData.lastName,
                formData.password
            );
        }
        clearData();
    };

    useEffect(() => {
        if (auth && auth.error) {
            setChangeError(auth.error);
        } else {
            setChangeError(null);
        }
    }, [auth]);

    const handleFNChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({ ...prevData, firstName: e.target.value }));
    };

    const handleLNChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData((prevData) => ({ ...prevData, lastName: e.target.value }));
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
            dataType="display name"
            openHeight={width && width < 1100 ? "350px" : "250px"}
            errorMsg={changeError}
        >
            <React.Fragment>
                <div className="customer-name">
                    <FormControl sx={{ marginBottom: "10px", flexGrow: 1 }}>
                        <FormLabel htmlFor="firstName">First Name</FormLabel>
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
                    <FormControl sx={{ marginBottom: "10px", flexGrow: 1 }}>
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
export default ChangeCustomerName;
