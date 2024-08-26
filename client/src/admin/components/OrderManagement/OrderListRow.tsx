import {
    Box,
    Checkbox,
    Collapse,
    IconButton,
    TableCell,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useEffect } from "react";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";
import { Link, useNavigate } from "react-router-dom";
// import MoreMenu from "./MoreMenu";
import { OrderRow } from "./OrdersList";
import ModeEditSharpIcon from "@mui/icons-material/ModeEditSharp";
import KeyboardArrowUpSharpIcon from "@mui/icons-material/KeyboardArrowUpSharp";
import KeyboardArrowDownSharpIcon from "@mui/icons-material/KeyboardArrowDownSharp";
import dayjs from "dayjs";

interface Props {
    row: OrderRow;
}
const OrderListRow: React.FC<Props> = ({ row }) => {
    const { width, isTouchDevice } = useWindowSizeContext();
    const [open, setOpen] = useState<boolean>(false);
    const navigate = useNavigate();

    return (
        <React.Fragment>
            <TableRow hover tabIndex={-1}>
                <TableCell
                    scope="row"
                    sx={{ cursor: "pointer", textDecoration: "underline" }}
                    onClick={() =>
                        navigate(`/orders/order-details?order=${row.orderNo}`)
                    }
                >
                    {row.orderNo}
                </TableCell>
                <TableCell align="left">
                    {dayjs(row.orderDate).format("YYYY-MM-DD HH:mm:ss")}
                </TableCell>
                {width && width >= 800 && (
                    <React.Fragment>
                        <TableCell align="right">{row.total}</TableCell>
                        <TableCell align="left">
                            {row.shippingAddress}
                        </TableCell>
                        <TableCell align="left">{row.state}</TableCell>
                        <TableCell align="left">{row.email}</TableCell>
                    </React.Fragment>
                )}
                <TableCell align="left">{row.orderStatus}</TableCell>
                {width && width < 800 && (
                    <TableCell
                        sx={{
                            position: "sticky",
                            right: 0,
                            backgroundColor: "white",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                alignItems: "center",
                            }}
                        >
                            <IconButton
                                size="small"
                                onClick={() => setOpen(!open)}
                            >
                                {open ? (
                                    <KeyboardArrowUpSharpIcon />
                                ) : (
                                    <KeyboardArrowDownSharpIcon />
                                )}
                            </IconButton>
                        </div>
                    </TableCell>
                )}
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
                                    <b>Order Total: </b> {row.total}
                                </Typography>

                                <Typography variant="body2">
                                    <b>Shipping Address: </b>
                                    {row.shippingAddress}
                                </Typography>
                                <Typography variant="body2">
                                    <b>State: </b> {row.state}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Email: </b> {row.email}
                                </Typography>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
};
export default OrderListRow;
