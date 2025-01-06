import React from "react";
import {
    TableCell,
    TableHead,
    TableRow,
    Box,
    TableSortLabel,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { Order } from "./CustomerOrdersList";

import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";
import { CustomerOrder } from "../../features/UserData/UserDataTypes";

interface HeadCell {
    disablePadding: boolean;
    id: keyof CustomerOrder | "actions";
    label: string;
    sortable: boolean;
    mobile: boolean;
}

export const headCells: readonly HeadCell[] = [
    {
        id: "orderNo",
        disablePadding: true,
        label: "ORDER NUMBER",
        sortable: true,
        mobile: true,
    },
    {
        id: "orderDate",
        disablePadding: false,
        label: "ORDER DATE",
        sortable: true,
        mobile: true,
    },
    {
        id: "totalAmount",
        disablePadding: false,
        label: "TOTAL",
        sortable: true,
        mobile: false,
    },
    {
        id: "shippingAddress",
        disablePadding: false,
        label: "SHIPPING ADDRESS",
        sortable: false,
        mobile: false,
    },
    {
        id: "stateAbbr",
        disablePadding: false,
        label: "STATE",
        sortable: true,
        mobile: false,
    },
    {
        id: "email",
        disablePadding: false,
        label: "EMAIL",
        sortable: false,
        mobile: false,
    },
    {
        id: "orderStatus",
        disablePadding: false,
        label: "ORDER STATUS",
        sortable: false,
        mobile: true,
    },
];

export interface EnhancedTableProps {
    onRequestSort: (
        event: React.MouseEvent<unknown>,
        property: keyof CustomerOrder
    ) => void;
    order: Order;
    orderBy: string;
}

const CustomerOrdersHead: React.FC<EnhancedTableProps> = (props) => {
    const { order, orderBy, onRequestSort } = props;
    const { width } = useWindowSizeContext();
    const handleSort =
        (property: keyof CustomerOrder) =>
        (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => {
                    if (
                        (width && width < 800 && headCell.mobile) ||
                        (width && width >= 800)
                    ) {
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
                                            orderBy === headCell.id
                                                ? order
                                                : "desc"
                                        }
                                        onClick={handleSort(
                                            headCell.id as keyof CustomerOrder
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
                                        headCell.disablePadding
                                            ? "none"
                                            : "normal"
                                    }
                                >
                                    {headCell.label}
                                </TableCell>
                            );
                        }
                    }
                })}
                {width && width < 800 && (
                    <TableCell
                        sx={{ width: "40px", position: "sticky", right: 0 }}
                    ></TableCell>
                )}
            </TableRow>
        </TableHead>
    );
};

export default CustomerOrdersHead;
