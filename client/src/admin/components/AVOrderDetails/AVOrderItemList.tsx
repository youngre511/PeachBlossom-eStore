import React, { SetStateAction } from "react";
import { Paper, Table, TableBody, TableContainer, Box } from "@mui/material";

import AVOrderItemListHead from "./AVOrderItemListHead";
import AVOrderItemListToolbar from "./AVOrderItemListToolbar";
import { IAVOrderItem } from "../../features/AVOrders/avOrdersTypes";
import AVOrderItemRow from "./AVOrderItemRow";

interface AVCatProps {
    orderItems: IAVOrderItem[];
    setOrderItems: React.Dispatch<SetStateAction<IAVOrderItem[]>>;
    handleSetSubtotal: (newSubtotal: number) => void;
    subTotal: number;
    editMode: boolean;
}

export interface OrderItemRow {
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
    const [rows, setRows] = React.useState<OrderItemRow[]>([]);
    const [cancelledRowNumber, setCancelledRowNumber] =
        React.useState<number>(0);

    React.useEffect(() => {
        const updatedRows = orderItems.map((item) => {
            const rowData: OrderItemRow = {
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
                            editMode={editMode}
                        />
                        <TableBody>
                            {rows.map((row, index) => (
                                <AVOrderItemRow
                                    key={row.productNo}
                                    row={row}
                                    isSelected={isSelected}
                                    editMode={editMode}
                                    handleClick={handleClick}
                                    handleChangeQuantity={handleChangeQuantity}
                                    handleChangeStatus={handleChangeStatus}
                                    index={index}
                                />
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        </Box>
    );
};

export default AVOrderItemList;
