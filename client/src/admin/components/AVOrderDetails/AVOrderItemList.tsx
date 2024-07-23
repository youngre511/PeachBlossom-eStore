import React, { SetStateAction } from "react";
import { useEffect } from "react";
import { useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/store";
import {
    styled,
    Paper,
    Table,
    TableBody,
    TableCell,
    tableCellClasses,
    TableContainer,
    TablePagination,
    TableRow,
    Box,
    Checkbox,
    Tooltip,
    IconButton,
    TextField,
} from "@mui/material";

import AVOrderItemListHead from "./AVOrderItemListHead";
import AVOrderItemListToolbar from "./AVOrderItemListToolbar";
import { useNavigate, Link } from "react-router-dom";
import AVOrderItemQuantity from "./AVOrderItemQuantity";
import AVOrderItemStatus from "./AVOrderItemStatus";
import { IAVOrderItem } from "../../features/AVOrders/avOrdersTypes";

interface AVCatProps {
    orderItems: IAVOrderItem[];
    setOrderItems: React.Dispatch<SetStateAction<IAVOrderItem[]>>;
    handleSetSubtotal: (newSubtotal: number) => void;
    subTotal: number;
    editMode: boolean;
}

interface Row {
    id: string;
    productNo: string;
    productName: string;
    price: string;
    quantity: string;
    itemTotal: string;
    status: string;
}

const AVOrderItemList: React.FC<AVCatProps> = ({
    orderItems,
    setOrderItems,
    handleSetSubtotal,
    subTotal,
    editMode,
}) => {
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    const [rows, setRows] = React.useState<Row[]>([]);
    const [cancelledRowNumber, setCancelledRowNumber] =
        React.useState<number>(0);

    React.useEffect(() => {
        const updatedRows = orderItems.map((item) => {
            const rowData: Row = {
                id: String(item.order_item_id),
                productNo: item.productNo,
                productName: item.Product.productName,
                price: `$${Number(item.priceWhenOrdered).toFixed(2)}`,
                quantity: String(item.quantity),
                itemTotal: `$${(
                    Number(item.priceWhenOrdered) * item.quantity
                ).toFixed(2)}`,
                status: item.fulfillmentStatus,
            };
            return rowData;
        });
        setRows(updatedRows);
    }, [orderItems]);

    const handleSelectAllClick = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (event.target.checked) {
            const newSelected = rows
                .filter((row) => row.status !== "cancelled")
                .map((n) => n.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleChangeSelectedStatus = (newStatus: string) => {
        const newOrderItems = [...orderItems];
        let subtotalAdjustment: number = 0;
        let rowsCancelled: number = 0;
        selected.forEach((id) => {
            const foundIndex = newOrderItems.findIndex(
                (item) => item.order_item_id === +id
            );
            if (foundIndex !== -1) {
                const item = newOrderItems[foundIndex];
                const oldStatus = item.fulfillmentStatus;
                item.fulfillmentStatus = newStatus;
                if (newStatus === "cancelled") {
                    if (oldStatus !== "cancelled") {
                        subtotalAdjustment +=
                            item.quantity * item.priceWhenOrdered;
                    }
                    rowsCancelled++;
                }
                newOrderItems[foundIndex] = item;
                setOrderItems(newOrderItems);
            }
        });
        if (newStatus === "cancelled") {
            handleSetSubtotal(subTotal - subtotalAdjustment);
            setCancelledRowNumber(rowsCancelled);
        }
    };

    const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: readonly string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }
        setSelected(newSelected);
    };

    const handleChangeQuantity = (newQuantity: string, item_id: string) => {
        const newOrderItems = [...orderItems];
        const foundIndex = newOrderItems.findIndex(
            (item) => item.order_item_id === +item_id
        );
        if (foundIndex !== -1) {
            const item = newOrderItems[foundIndex];
            const oldItemTotal = item.quantity * item.priceWhenOrdered;
            const newItemTotal = +newQuantity * item.priceWhenOrdered;
            const subtotalAdjustment = newItemTotal - oldItemTotal;
            item.quantity = +newQuantity;
            newOrderItems[foundIndex] = item;
            setOrderItems(newOrderItems);
            handleSetSubtotal(subTotal + subtotalAdjustment);
        }
    };

    const handleChangeStatus = (
        newStatus: string,
        item_id: string,
        oldStatus: string,
        priceWhenOrdered: number,
        quantity: number
    ) => {
        const newOrderItems = [...orderItems];
        const foundIndex = newOrderItems.findIndex(
            (item) => item.order_item_id === +item_id
        );
        if (foundIndex !== -1) {
            const item = newOrderItems[foundIndex];
            item.fulfillmentStatus = newStatus;
            if (newStatus === "cancelled") {
                handleSetSubtotal(subTotal - quantity * priceWhenOrdered);
                setCancelledRowNumber(cancelledRowNumber + 1);
            } else {
                if (oldStatus === "cancelled") {
                    handleSetSubtotal(subTotal + quantity * priceWhenOrdered);
                    setCancelledRowNumber(cancelledRowNumber - 1);
                }
            }
            newOrderItems[foundIndex] = item;
            setOrderItems(newOrderItems);
        }
    };

    const isSelected = (id: string) => selected.indexOf(id) !== -1;

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
                <AVOrderItemListToolbar
                    numSelected={selected.length}
                    handleChangeSelectedStatus={handleChangeSelectedStatus}
                />
                <TableContainer sx={{ maxHeight: 500 }}>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size={"medium"}
                        stickyHeader
                        aria-label="sticky table"
                    >
                        <AVOrderItemListHead
                            numSelected={selected.length}
                            onSelectAllClick={handleSelectAllClick}
                            rowCount={rows.length}
                            cancelledRowCount={cancelledRowNumber}
                        />
                        <TableBody>
                            {rows.map((row, index) => {
                                const isItemSelected = isSelected(row.id);
                                const labelId = `enhanced-table-checkbox-${index}`;

                                return (
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
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                color="primary"
                                                disabled={
                                                    row.status === "cancelled"
                                                }
                                                onClick={(event) =>
                                                    handleClick(event, row.id)
                                                }
                                                checked={isItemSelected}
                                                inputProps={{
                                                    "aria-labelledby": labelId,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell
                                            component="th"
                                            id={labelId}
                                            scope="row"
                                            padding="none"
                                            sx={{ minWidth: "131px" }}
                                        >
                                            {row.productNo}
                                        </TableCell>
                                        <TableCell
                                            component="th"
                                            id={labelId}
                                            scope="row"
                                            sx={{ minWidth: "143px" }}
                                        >
                                            <Link
                                                to={`/products/product-details?product=${row.productNo}`}
                                            >
                                                {row.productName}
                                            </Link>
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.price}
                                        </TableCell>
                                        <TableCell align="right">
                                            {editMode ? (
                                                <div className="quantity-field">
                                                    <AVOrderItemQuantity
                                                        quantity={row.quantity}
                                                        item_id={row.id}
                                                        handleChangeQuantity={
                                                            handleChangeQuantity
                                                        }
                                                        disabled={
                                                            row.status ===
                                                            "cancelled"
                                                        }
                                                    />
                                                </div>
                                            ) : (
                                                row.quantity
                                            )}
                                        </TableCell>
                                        <TableCell
                                            align="right"
                                            sx={{ minWidth: "111px" }}
                                        >
                                            {row.status === "cancelled"
                                                ? "$0"
                                                : row.itemTotal}
                                        </TableCell>
                                        <TableCell align="left">
                                            {editMode ? (
                                                <AVOrderItemStatus
                                                    item_id={row.id}
                                                    status={row.status}
                                                    quantity={+row.quantity}
                                                    priceWhenOrdered={
                                                        +row.price.slice(1)
                                                    }
                                                    handleChangeStatus={
                                                        handleChangeStatus
                                                    }
                                                />
                                            ) : (
                                                row.status
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default AVOrderItemList;
