import {
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    SvgIconProps,
} from "@mui/material";
import React, { ComponentType, SVGProps } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface AdminNavItemProps {
    path?: string;
    url?: string;
    text: string;
    Icon:
        | React.ComponentType<SvgIconProps>
        | ComponentType<SVGProps<SVGSVGElement>>;
}
const AdminNavItem: React.FC<AdminNavItemProps> = ({
    path,
    url,
    text,
    Icon,
}) => {
    const navigate = useNavigate();
    return (
        <ListItem disablePadding>
            <ListItemButton
                onClick={() => {
                    if (path) {
                        navigate(path);
                    }
                    if (url) {
                        window.open(url, "_blank", "noopener");
                    }
                }}
            >
                <ListItemIcon>
                    <Icon className="menu-svg" />
                </ListItemIcon>
                <ListItemText primary={text} />
            </ListItemButton>
        </ListItem>
    );
};
export default AdminNavItem;
