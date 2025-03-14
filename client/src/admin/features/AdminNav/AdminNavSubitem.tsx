import { ListItem, ListItemButton, ListItemText } from "@mui/material";
import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AdminNavSubitemProps {
    path: string;
    text: string;
}
const AdminNavSubitem: React.FC<AdminNavSubitemProps> = ({ path, text }) => {
    const navigate = useNavigate();
    return (
        <ListItem disablePadding>
            <ListItemButton
                sx={{ paddingLeft: 2 }}
                onClick={() => navigate(path)}
            >
                <ListItemText secondary={text} />
            </ListItemButton>
        </ListItem>
    );
};
export default AdminNavSubitem;
