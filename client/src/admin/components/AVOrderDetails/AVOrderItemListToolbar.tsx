import React from "react";
import { alpha, Toolbar, Typography, IconButton, Tooltip } from "@mui/material";
import DeleteSharpIcon from "@mui/icons-material/DeleteSharp";
import ArchiveSharpIcon from "@mui/icons-material/ArchiveSharp";
import UnarchiveSharpIcon from "@mui/icons-material/UnarchiveSharp";
import DoDisturbSharpIcon from "@mui/icons-material/DoDisturbSharp";

export interface AVProductTableToolbarProps {
    numSelected: number;
    handleCancelSelected: () => void;
}

const AVOrderItemListToolbar: React.FC<AVProductTableToolbarProps> = (
    props
) => {
    const { numSelected, handleCancelSelected } = props;

    return (
        <Toolbar
            sx={{
                pl: { sm: 2 },
                pr: { xs: 1, sm: 1 },
                ...(numSelected > 0 && {
                    bgcolor: (theme) =>
                        alpha(
                            theme.palette.primary.main,
                            theme.palette.action.activatedOpacity
                        ),
                }),
            }}
        >
            {numSelected > 0 ? (
                <Typography
                    sx={{ flex: "1 1 100%" }}
                    color="inherit"
                    variant="subtitle1"
                    component="div"
                >
                    {numSelected} selected
                </Typography>
            ) : (
                <Typography
                    sx={{ flex: "1 1 100%" }}
                    variant="h6"
                    id="tableTitle"
                    component="div"
                >
                    Products
                </Typography>
            )}
            {numSelected > 0 && (
                <React.Fragment>
                    <Tooltip title="Cancel Item(s)">
                        <IconButton onClick={handleCancelSelected}>
                            <DoDisturbSharpIcon />
                        </IconButton>
                    </Tooltip>
                </React.Fragment>
            )}
        </Toolbar>
    );
};

export default AVOrderItemListToolbar;
