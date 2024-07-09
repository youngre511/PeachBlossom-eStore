import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";
import MoreVertSharpIcon from "@mui/icons-material/MoreVertSharp";

interface Props {
    productNo: string;
    discontinued: boolean;
}
const MoreMenu: React.FC<Props> = ({ productNo, discontinued }) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <div>
            <Tooltip title="More Options">
                <IconButton
                    id={`${productNo}-more`}
                    aria-controls={open ? `${productNo}-menu` : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? "true" : undefined}
                    onClick={handleClick}
                >
                    <MoreVertSharpIcon />
                </IconButton>
            </Tooltip>
            <Menu
                id={`${productNo}-menu`}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                    "aria-labelledby": "basic-button",
                }}
            >
                {!discontinued ? (
                    <MenuItem onClick={handleClose}>Discontinue</MenuItem>
                ) : (
                    <MenuItem onClick={handleClose}>Reactivate</MenuItem>
                )}

                <MenuItem onClick={handleClose}>Permanently Delete</MenuItem>
            </Menu>
        </div>
    );
};
export default MoreMenu;
