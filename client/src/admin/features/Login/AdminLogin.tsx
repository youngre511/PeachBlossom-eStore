import * as React from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";

import TextField from "@mui/material/TextField";

import Link from "@mui/material/Link";

import Box from "@mui/material/Box";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import { AuthContext } from "../../../common/contexts/authContext";
import { useNavigate } from "react-router-dom";
import "./admin-login.css";

export default function AdminLogin() {
    const [error, setError] = React.useState<string>("");
    const auth = React.useContext(AuthContext);
    const navigate = useNavigate();
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const username = data.get("username");
        const password = data.get("password");
        if (auth && username && password) {
            auth.login(username as string, password as string, "admin");
        }
    };

    React.useEffect(() => {
        if (
            auth &&
            !auth.isTokenExpired() &&
            auth.user &&
            auth.user.role === "admin"
        ) {
            navigate("/dashboard/sales");
        }
    }, [auth]);

    return (
        <Container
            component="main"
            maxWidth="xl"
            sx={{
                position: "fixed",
                left: 0,
                top: 0,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100vw",
            }}
        >
            <Box
                maxWidth="500px"
                sx={{
                    marginTop: 8,
                    marginBottom: 16,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    backgroundColor: "white",
                    padding: 8,
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: "peach.extraDark" }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>
                {auth && auth.error && (
                    <Typography
                        component="span"
                        variant="subtitle1"
                        sx={{ color: "peach.extraDark" }}
                    >
                        {auth.error}
                    </Typography>
                )}
                <Box
                    component="form"
                    onSubmit={handleSubmit}
                    noValidate
                    sx={{ mt: 1 }}
                >
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                    />
                    {/* <FormControlLabel
                        control={<Checkbox value="remember" color="primary" />}
                        label="Remember me"
                    /> */}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Sign In
                    </Button>
                    <Typography component="span" variant="subtitle1">
                        For view-only access, use username "peachblossom" and
                        password "portfolio". <br />
                        <br />
                        Prospective employers can request higher-level access
                        through the contact form on my{" "}
                        <Link
                            href="https://www.ryanyoung.codes"
                            underline="none"
                        >
                            portfolio
                        </Link>
                        .
                    </Typography>
                    {/* <Grid container>
                        <Grid item xs>
                            <Link href="#" variant="body2">
                                Forgot password?
                            </Link>
                        </Grid>
                    </Grid> */}
                </Box>
            </Box>
        </Container>
    );
}
