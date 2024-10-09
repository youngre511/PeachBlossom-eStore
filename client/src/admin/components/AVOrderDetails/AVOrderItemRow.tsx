import {
    Box,
    Checkbox,
    Collapse,
    IconButton,
    TableCell,
    TableRow,
    Typography,
} from "@mui/material";
import React, { useState } from "react";

import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";
import { useNavigate } from "react-router-dom";

import KeyboardArrowUpSharpIcon from "@mui/icons-material/KeyboardArrowUpSharp";
import KeyboardArrowDownSharpIcon from "@mui/icons-material/KeyboardArrowDownSharp";
import { OrderItemRow } from "./AVOrderItemList";
import AVOrderItemStatus from "./AVOrderItemStatus";
import AVOrderItemQuantity from "./AVOrderItemQuantity";

interface Props {
    row: OrderItemRow;
    index: number;
    editMode: boolean;
    handleClick: (event: React.MouseEvent<unknown>, id: string) => void;
    isSelected: (id: string) => boolean;
    handleChangeQuantity: (newQuantity: string, item_id: string) => void;
    handleChangeStatus: (
        newStatus: string,
        item_id: string,
        oldStatus: string
    ) => void;
}
const AVOrderItemRow: React.FC<Props> = ({
    row,
    index,
    editMode,
    handleClick,
    isSelected,
    handleChangeQuantity,
    handleChangeStatus,
}) => {
    const { width, isTouchDevice } = useWindowSizeContext();
    const [open, setOpen] = useState<boolean>(false);
    const labelId = `enhanced-table-checkbox-${index}`;
    const isItemSelected = isSelected(row.id);
    const navigate = useNavigate();

    return (
        <React.Fragment>
            <TableRow
                hover
                aria-checked={isItemSelected}
                tabIndex={-1}
                key={row.id}
                selected={isItemSelected}
                sx={{
                    cursor: "pointer",
                    backgroundColor:
                        row.status === "discontinued"
                            ? "darkgray"
                            : "undefined",
                }}
            >
                {width && width >= 1000 && editMode && (
                    <TableCell padding="checkbox">
                        <Checkbox
                            color="primary"
                            disabled={row.status === "cancelled"}
                            onClick={(event) => handleClick(event, row.id)}
                            checked={isItemSelected}
                            inputProps={{
                                "aria-labelledby": labelId,
                            }}
                        />
                    </TableCell>
                )}
                <TableCell
                    component="th"
                    id={labelId}
                    scope="row"
                    padding={
                        width && width >= 1000 && editMode ? "none" : "normal"
                    }
                    sx={{
                        minWidth: "131px",
                        borderBottom:
                            width && width < 1000 && !open
                                ? "1px solid rgba(224, 224, 224, 0);"
                                : undefined,
                        transition: "border .28s ease-out",
                    }}
                    onClick={() =>
                        navigate(
                            `/products/product-details?product=${row.productNo}`
                        )
                    }
                >
                    {row.productNo}
                </TableCell>
                {width && width >= 1000 && (
                    <React.Fragment>
                        <TableCell
                            component="th"
                            id={labelId}
                            scope="row"
                            sx={{ minWidth: "143px" }}
                            onClick={() =>
                                navigate(
                                    `/products/product-details?product=${row.productNo}`
                                )
                            }
                        >
                            {row.productName}
                        </TableCell>
                        <TableCell align="right">{row.price}</TableCell>
                    </React.Fragment>
                )}

                <TableCell
                    align="right"
                    sx={
                        width && width < 1000 && !open
                            ? {
                                  borderBottom: !open
                                      ? "1px solid rgba(224, 224, 224, 0);"
                                      : undefined,
                                  transition: "border .28s ease-out",
                              }
                            : {}
                    }
                >
                    {editMode ? (
                        <div className="quantity-field">
                            <AVOrderItemQuantity
                                quantity={row.quantity}
                                item_id={row.id}
                                handleChangeQuantity={handleChangeQuantity}
                                disabled={row.status === "cancelled"}
                            />
                        </div>
                    ) : (
                        row.quantity
                    )}
                </TableCell>
                {width && width >= 1000 && (
                    <TableCell align="right" sx={{ minWidth: "111px" }}>
                        {row.status === "cancelled" ? "$0" : row.itemTotal}
                    </TableCell>
                )}
                <TableCell
                    align="left"
                    sx={
                        width && width < 1000 && !open
                            ? {
                                  borderBottom: !open
                                      ? "1px solid rgba(224, 224, 224, 0);"
                                      : undefined,
                                  transition: "border .28s ease-out",
                              }
                            : {}
                    }
                >
                    {editMode ? (
                        <AVOrderItemStatus
                            item_id={row.id}
                            status={row.status}
                            quantity={+row.quantity}
                            priceWhenOrdered={+row.price.slice(1)}
                            handleChangeStatus={handleChangeStatus}
                        />
                    ) : (
                        row.status
                    )}
                </TableCell>
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
                                    <b>Product Name: </b> {row.productName}
                                </Typography>

                                <Typography variant="body2">
                                    <b>Price: </b>
                                    {row.price}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Item Total (qty x price): </b>{" "}
                                    {row.status === "cancelled"
                                        ? "$0"
                                        : row.itemTotal}
                                </Typography>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
};
export default AVOrderItemRow;
