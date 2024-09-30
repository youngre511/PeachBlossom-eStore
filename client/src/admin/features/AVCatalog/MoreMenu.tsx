import { IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import React from "react";
import MoreVertSharpIcon from "@mui/icons-material/MoreVertSharp";
import { useNavigate } from "react-router-dom";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

interface Props {
    productNo: string;
    discontinued: boolean;
    handleProductActivate: (productNo: string) => void;
    handleProductDiscontinue: (productNo: string) => void;
}
const MoreMenu: React.FC<Props> = ({
    productNo,
    discontinued,
    handleProductActivate,
    handleProductDiscontinue,
}) => {
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };
    const navigate = useNavigate();
    const { width } = useWindowSizeContext();

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
                {!discontinued && width && width < 600 && (
                    <MenuItem
                        onClick={() =>
                            navigate(
                                `/products/product-details?product=${productNo}&editing=true`
                            )
                        }
                    >
                        Edit
                    </MenuItem>
                )}
                {!discontinued ? (
                    <MenuItem
                        onClick={() => {
                            handleProductDiscontinue(productNo);
                            handleClose();
                        }}
                    >
                        Discontinue
                    </MenuItem>
                ) : (
                    <MenuItem
                        onClick={() => {
                            handleProductActivate(productNo);
                            handleClose();
                        }}
                    >
                        Reactivate
                    </MenuItem>
                )}
            </Menu>
        </div>
    );
};
export default MoreMenu;
