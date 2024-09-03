import {
    Box,
    Collapse,
    IconButton,
    TableCell,
    TableRow,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";
import { useNavigate } from "react-router-dom";
import { AdminRow } from "./AdminList";
import KeyboardArrowUpSharpIcon from "@mui/icons-material/KeyboardArrowUpSharp";
import KeyboardArrowDownSharpIcon from "@mui/icons-material/KeyboardArrowDownSharp";
import AdminMoreMenu from "./AdminMoreMenu";

interface Props {
    row: AdminRow;
    handleResetPassword: (user_id: number) => void;
    handleUserDelete: (user_id: number) => void;
    handleChangeAccessLevel: (
        username: string,
        oldAccessLevel: "full" | "limited" | "view only",
        newAccessLevel: "full" | "limited" | "view only"
    ) => void;
}
const AdminListRow: React.FC<Props> = ({
    row,
    handleResetPassword,
    handleUserDelete,
    handleChangeAccessLevel,
}) => {
    const { width, isTouchDevice } = useWindowSizeContext();
    const [open, setOpen] = useState<boolean>(false);

    const navigate = useNavigate();

    return (
        <React.Fragment>
            <TableRow hover tabIndex={-1} key={row.user_id}>
                {width && width >= 800 && (
                    <TableCell align="left" sx={{ minWidth: "57px" }}>
                        {row.user_id}
                    </TableCell>
                )}

                <TableCell align="left">{row.username}</TableCell>
                {width && width >= 800 && (
                    <TableCell align="left" sx={{ minWidth: "98px" }}>
                        {row.admin_id}
                    </TableCell>
                )}

                <TableCell align="left" sx={{ minWidth: "90px" }}>
                    {row.accessLevel}
                </TableCell>
                {width && width >= 800 && (
                    <TableCell align="left">
                        {String(row.defaultPassword)}
                    </TableCell>
                )}
                <TableCell
                    align="left"
                    sx={{
                        position: "sticky",
                        right: 0,
                        backgroundColor: "white",
                    }}
                >
                    {row.username !== "youngre511" && (
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                            }}
                        >
                            <AdminMoreMenu
                                user_id={row.user_id}
                                username={row.username}
                                currentAccessLevel={row.accessLevel}
                                isDefaultPassword={row.defaultPassword}
                                handleResetPassword={handleResetPassword}
                                handleUserDelete={handleUserDelete}
                                handleChangeAccessLevel={
                                    handleChangeAccessLevel
                                }
                            />
                            {width && width < 800 && (
                                <IconButton
                                    size="small"
                                    onClick={() => setOpen(!open)}
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
                                    {open ? (
                                        <KeyboardArrowUpSharpIcon />
                                    ) : (
                                        <KeyboardArrowDownSharpIcon />
                                    )}
                                </IconButton>
                            )}
                        </div>
                    )}
                </TableCell>
            </TableRow>
            {width && width < 800 && (
                <TableRow>
                    <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={3}
                    >
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box margin={1}>
                                {/* Data that is hidden in the main row but appears in the collapsible section */}
                                <Typography variant="body2">
                                    <b>User ID: </b> {row.user_id}
                                </Typography>

                                <Typography variant="body2">
                                    <b>Admin ID: </b>
                                    {row.admin_id}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Default Password?: </b>
                                    {String(row.defaultPassword)}
                                </Typography>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
};
export default AdminListRow;
