import React from "react";
import { alpha, Toolbar, Typography, IconButton, Tooltip } from "@mui/material";

import ThumbUpAltSharpIcon from "@mui/icons-material/ThumbUpAltSharp";
import HourglassFullSharpIcon from "@mui/icons-material/HourglassFullSharp";
import BackHandIcon from "@mui/icons-material/BackHand";
import WarningSharpIcon from "@mui/icons-material/WarningSharp";
import DisabledByDefaultSharpIcon from "@mui/icons-material/DisabledByDefaultSharp";

export interface AVProductTableToolbarProps {
    numSelected: number;
    handleChangeSelectedStatus: (newStatus: string) => void;
}

const AVOrderItemListToolbar: React.FC<AVProductTableToolbarProps> = (
    props
) => {
    const { numSelected, handleChangeSelectedStatus } = props;

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
                    <Tooltip title="Fulfill Items">
                        <IconButton
                            onClick={() =>
                                handleChangeSelectedStatus("fulfilled")
                            }
                        >
                            <ThumbUpAltSharpIcon />
                        </IconButton>
                    </Tooltip>
                    {/* <Tooltip title="Ship Items">
                        <IconButton
                            onClick={() =>
                                handleChangeSelectedStatus("shipped")
                            }
                        >
                            <LocalShippingSharpIcon />
                        </IconButton>
                    </Tooltip> */}
                    <Tooltip title="Put Items on Hold">
                        <IconButton
                            onClick={() =>
                                handleChangeSelectedStatus("on hold")
                            }
                        >
                            <BackHandIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Mark Items as Back Ordered">
                        <IconButton
                            onClick={() =>
                                handleChangeSelectedStatus("back ordered")
                            }
                        >
                            <HourglassFullSharpIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Mark Exception">
                        <IconButton
                            onClick={() =>
                                handleChangeSelectedStatus("exception")
                            }
                        >
                            <WarningSharpIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel Item(s)">
                        <IconButton
                            onClick={() =>
                                handleChangeSelectedStatus("cancelled")
                            }
                        >
                            <DisabledByDefaultSharpIcon />
                        </IconButton>
                    </Tooltip>
                </React.Fragment>
            )}
        </Toolbar>
    );
};

export default AVOrderItemListToolbar;
