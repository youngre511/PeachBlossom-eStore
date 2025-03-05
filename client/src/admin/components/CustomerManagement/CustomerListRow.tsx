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
import { CustomerRow } from "./CustomerList";
import KeyboardArrowUpSharpIcon from "@mui/icons-material/KeyboardArrowUpSharp";
import KeyboardArrowDownSharpIcon from "@mui/icons-material/KeyboardArrowDownSharp";
import CustomerMoreMenu from "./CustomerMoreMenu";

interface Props {
    row: CustomerRow;
    handleResetPassword: (user_id: number) => void;
    handleUserDelete: (user_id: number) => void;
}
const CustomerListRow: React.FC<Props> = ({
    row,
    handleResetPassword,
    handleUserDelete,
}) => {
    const { width, isTouchDevice } = useWindowSizeContext();
    const [open, setOpen] = useState<boolean>(false);
    console.log(row);

    const navigate = useNavigate();

    return (
        <React.Fragment>
            <TableRow hover tabIndex={-1} key={row.user_id}>
                {width && width >= 800 && (
                    <TableCell align="left" sx={{ minWidth: "57px" }}>
                        {row.user_id}
                    </TableCell>
                )}

                <TableCell
                    align="left"
                    sx={
                        width && width < 800 && !open
                            ? {
                                  borderBottom:
                                      "1px solid rgba(224, 224, 224, 0);",
                                  transition: "border .28s ease-out",
                              }
                            : {}
                    }
                >
                    {row.username}
                </TableCell>
                {width && width >= 800 && (
                    <TableCell align="left" sx={{ minWidth: "126px" }}>
                        {row.customer_id}
                    </TableCell>
                )}

                <TableCell
                    align="left"
                    sx={{
                        minWidth: "90px",
                        borderBottom:
                            width && width < 800 && !open
                                ? "1px solid rgba(224, 224, 224, 0);"
                                : undefined,
                        transition: "border .3s ease-out",
                    }}
                >
                    {row.email}
                </TableCell>
                {width && width >= 800 && (
                    <React.Fragment>
                        <TableCell align="left" sx={{ minWidth: "90px" }}>
                            {row.totalOrders}
                        </TableCell>
                        <TableCell align="left" sx={{ minWidth: "90px" }}>
                            ${Number(row.totalSpent).toFixed(2)}
                        </TableCell>

                        <TableCell align="left">
                            {String(row.defaultPassword)}
                        </TableCell>
                    </React.Fragment>
                )}
                <TableCell
                    align="left"
                    sx={{
                        position: "sticky",
                        right: 0,
                        backgroundColor: "white",
                        borderBottom:
                            width && width < 800 && !open
                                ? "1px solid rgba(224, 224, 224, 0);"
                                : undefined,
                        transition: "border .3s ease-out",
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
                            <CustomerMoreMenu
                                user_id={row.user_id}
                                username={row.username}
                                isDefaultPassword={row.defaultPassword}
                                handleResetPassword={handleResetPassword}
                                handleUserDelete={handleUserDelete}
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
                                    <b>CUSTOMER ID: </b>
                                    {row.customer_id}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Orders Placed: </b> {row.totalOrders}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Amount Spent: </b> {row.totalSpent}
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
export default CustomerListRow;
