import React from "react";
import { alpha, Toolbar, Typography, IconButton, Tooltip } from "@mui/material";
import DeleteSharpIcon from "@mui/icons-material/DeleteSharp";
import ArchiveSharpIcon from "@mui/icons-material/ArchiveSharp";
import UnarchiveSharpIcon from "@mui/icons-material/UnarchiveSharp";

export interface AVProductTableToolbarProps {
    numSelected: number;
}

const AVProductTableToolbar: React.FC<AVProductTableToolbarProps> = (props) => {
    const { numSelected } = props;

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
                    <Tooltip title="Reactivate">
                        <IconButton>
                            <UnarchiveSharpIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Discontinue">
                        <IconButton>
                            <ArchiveSharpIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Permanently Delete">
                        <IconButton>
                            <DeleteSharpIcon />
                        </IconButton>
                    </Tooltip>
                </React.Fragment>
            )}
        </Toolbar>
    );
};

export default AVProductTableToolbar;
