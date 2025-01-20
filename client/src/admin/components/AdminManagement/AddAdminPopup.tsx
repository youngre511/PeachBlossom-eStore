import {
    Button,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    TextField,
} from "@mui/material";
import React from "react";
import { inputStyle } from "../Products/AddProduct/AddProduct";

interface Props {
    setAddingUser: React.Dispatch<React.SetStateAction<boolean>>;
    handleAddAdmin: (e: React.FormEvent<HTMLFormElement>) => void;
}
const AddAdminPopup: React.FC<Props> = ({ setAddingUser, handleAddAdmin }) => {
    return (
        <div
            className="add-admin-container"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100dvh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 30,
            }}
        >
            <div
                className="add-admin-popup"
                style={{
                    width: "375px",
                    height: "450px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "5px solid #ec7f52",
                    boxShadow: "0 0 3px 2px rgba(0, 0, 0, 0.3)",
                    backgroundColor: "var(--peach-blossom)",
                    borderRadius: "10px",
                }}
            >
                <h2>Add New Admin</h2>
                <form
                    onSubmit={handleAddAdmin}
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-around",
                        alignItems: "center",
                        height: "80%",
                    }}
                >
                    <TextField
                        fullWidth
                        label="Username"
                        name="username"
                        required={true}
                        sx={inputStyle}
                        slotProps={{
                            htmlInput: { sx: { backgroundColor: "white" } },
                        }}
                    />
                    <FormControl>
                        <FormLabel id="accessLevelLabel">
                            Access Level
                        </FormLabel>
                        <RadioGroup
                            aria-labelledby="accessLevelLabel"
                            defaultValue="limited"
                            name="accessLevel"
                            row
                        >
                            <FormControlLabel
                                value="full"
                                control={<Radio />}
                                label="Full"
                            />
                            <FormControlLabel
                                value="limited"
                                control={<Radio />}
                                label="Limited"
                            />
                            <FormControlLabel
                                value="view only"
                                control={<Radio />}
                                label="View Only"
                            />
                        </RadioGroup>
                    </FormControl>
                    <div
                        className="add-admin-buttons"
                        style={{
                            display: "flex",
                            justifyContent: "space-around",
                            width: "100%",
                        }}
                    >
                        <Button type="submit" variant="contained">
                            Create
                        </Button>
                        <Button
                            onClick={() => setAddingUser(false)}
                            variant="outlined"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default AddAdminPopup;
