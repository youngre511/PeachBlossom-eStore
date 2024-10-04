import React, { useState } from "react";
import { useEffect } from "react";
import {
    Box,
    Collapse,
    IconButton,
    TableCell,
    TableRow,
    Typography,
} from "@mui/material";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";
import { OrderItem } from "./OrderStatus";
import KeyboardArrowUpSharpIcon from "@mui/icons-material/KeyboardArrowUpSharp";
import KeyboardArrowDownSharpIcon from "@mui/icons-material/KeyboardArrowDownSharp";

interface Props {
    item: OrderItem;
}
const OrderStatusProductRow: React.FC<Props> = ({ item }) => {
    const { width } = useWindowSizeContext();
    const [open, setOpen] = useState<boolean>(false);

    return (
        <React.Fragment>
            <TableRow key={item.Product.productName}>
                <TableCell
                    sx={
                        width && width < 1000 && !open
                            ? {
                                  borderBottom: !open
                                      ? "1px solid rgba(224, 224, 224, 0);"
                                      : undefined,
                                  transition: "border .3s ease-out",
                              }
                            : {}
                    }
                >
                    <img
                        src={`${item.Product.thumbnailUrl}_140.webp`}
                        alt={item.Product.productName}
                        className="order-status-thumbnail"
                        width="40px"
                        height="40px"
                        loading="lazy"
                    />
                </TableCell>
                {width && width > 1000 && (
                    <TableCell>{item.productNo}</TableCell>
                )}
                <TableCell
                    component="th"
                    scope="row"
                    sx={
                        width && width < 1000 && !open
                            ? {
                                  borderBottom: !open
                                      ? "1px solid rgba(224, 224, 224, 0);"
                                      : undefined,
                                  transition: "border .3s ease-out",
                              }
                            : {}
                    }
                >
                    {item.Product.productName}
                </TableCell>
                <TableCell
                    sx={
                        width && width < 1000 && !open
                            ? {
                                  borderBottom:
                                      "1px solid rgba(224, 224, 224, 0);",
                                  transition: "border .28s ease-out",
                              }
                            : {}
                    }
                >
                    {item.quantity}
                </TableCell>
                {width && width > 1000 && (
                    <TableCell align="right">
                        ${item.priceWhenOrdered}
                    </TableCell>
                )}
                {width && width < 1000 && (
                    <TableCell
                        sx={{
                            position: "sticky",
                            right: 0,
                            backgroundColor: "white",
                            zIndex: 1,
                            borderBottom: !open
                                ? "1px solid rgba(224, 224, 224, 0);"
                                : undefined,
                            transition: "border .3s ease-out",
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
            {width && width < 1000 && (
                <TableRow>
                    <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={4}
                    >
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box margin={1}>
                                {/* Data that is hidden in the main row but appears in the collapsible section */}
                                <Typography variant="body2">
                                    <b>Product No.: </b> {item.productNo}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Price: </b>
                                    {item.priceWhenOrdered}
                                </Typography>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
};
export default OrderStatusProductRow;
