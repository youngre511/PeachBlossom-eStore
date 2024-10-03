import {
    Divider,
    IconButton,
    ListItemIcon,
    ListItemText,
    Menu,
    MenuItem,
    Tooltip,
} from "@mui/material";
import React from "react";
import MoreVertSharpIcon from "@mui/icons-material/MoreVertSharp";
import { Check } from "@mui/icons-material";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

interface Props {
    user_id: number;
    username: string;
    isDefaultPassword: boolean;
    handleResetPassword: (user_id: number) => void;
    handleUserDelete: (user_id: number) => void;
}
const CustomerMoreMenu: React.FC<Props> = ({
    user_id,
    username,
    isDefaultPassword,
    handleResetPassword,
    handleUserDelete,
}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const { isTouchDevice } = useWindowSizeContext();

    return (
        <div>
            <Tooltip title="Action Menu">
                <IconButton
                    id={`${user_id}-more`}
                    aria-controls={open ? `${user_id}-menu` : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleClick}
                    sx={
                        isTouchDevice
                            ? {
                                  width: "40px",
                                  height: "40px",
                                  marginLeft: "8px",
                              }
                            : undefined
                    }
                >
                    <MoreVertSharpIcon />
                </IconButton>
            </Tooltip>
            <Menu
                id={`${user_id}-menu`}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button",
                }}
            >
                <MenuItem
                    onClick={() => {
                        handleResetPassword(user_id);
                        handleClose();
                    }}
                    disabled={isDefaultPassword}
                >
                    Reset Password
                </MenuItem>
                <MenuItem
                    onClick={() => {
                        handleUserDelete(user_id);
                        handleClose();
                    }}
                >
                    Delete User
                </MenuItem>
            </Menu>
        </div>
    );
};
export default CustomerMoreMenu;
