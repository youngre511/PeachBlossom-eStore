import React from "react";
import {
    TableCell,
    TableHead,
    TableRow,
    Box,
    TableSortLabel,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { Order } from "./OrdersList";
import { IAVOrder } from "../../features/AVOrders/avOrdersTypes";

interface HeadCell {
    disablePadding: boolean;
    id: keyof IAVOrder | "actions";
    label: string;
    sortable: boolean;
}

export const headCells: readonly HeadCell[] = [
    {
        id: "orderNo",
        disablePadding: true,
        label: "ORDER NUMBER",
        sortable: true,
    },
    {
        id: "orderDate",
        disablePadding: false,
        label: "ORDER DATE",
        sortable: true,
    },
    {
        id: "totalAmount",
        disablePadding: false,
        label: "TOTAL",
        sortable: true,
    },
    {
        id: "shippingAddress",
        disablePadding: false,
        label: "SHIPPING ADDRESS",
        sortable: false,
    },
    {
        id: "stateAbbr",
        disablePadding: false,
        label: "STATE",
        sortable: true,
    },
    {
        id: "email",
        disablePadding: false,
        label: "EMAIL",
        sortable: false,
    },
    {
        id: "orderStatus",
        disablePadding: false,
        label: "ORDER STATUS",
        sortable: false,
    },
];

export interface EnhancedTableProps {
    onRequestSort: (
        event: React.MouseEvent<unknown>,
        property: keyof IAVOrder
    ) => void;
    order: Order;
    orderBy: string;
}

const OrdersListHead: React.FC<EnhancedTableProps> = (props) => {
    const { order, orderBy, onRequestSort } = props;

    const handleSort =
        (property: keyof IAVOrder) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => {
                    if (headCell.sortable) {
                        return (
                            <TableCell
                                key={headCell.id}
                                align={"left"}
                                sortDirection={
                                    orderBy === headCell.id ? order : false
                                }
                            >
                                <TableSortLabel
                                    active={orderBy === headCell.id}
                                    direction={
                                        orderBy === headCell.id ? order : "desc"
                                    }
                                    onClick={handleSort(
                                        headCell.id as keyof IAVOrder
                                    )}
                                >
                                    {headCell.label}
                                    {orderBy === headCell.id ? (
                                        <Box
                                            component="span"
                                            sx={visuallyHidden}
                                        >
                                            {order === "desc"
                                                ? "sorted descending"
                                                : "sorted ascending"}
                                        </Box>
                                    ) : null}
                                </TableSortLabel>
                            </TableCell>
                        );
                    } else {
                        return (
                            <TableCell
                                key={headCell.id}
                                align={"left"}
                                padding={
                                    headCell.disablePadding ? "none" : "normal"
                                }
                            >
                                {headCell.label}
                            </TableCell>
                        );
                    }
                })}
            </TableRow>
        </TableHead>
    );
};

export default OrdersListHead;
