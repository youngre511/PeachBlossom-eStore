import React from "react";
import { AVProduct } from "../../features/AVCatalog/avCatalogTypes";
import {
    TableCell,
    TableHead,
    TableRow,
    Box,
    Checkbox,
    TableSortLabel,
    Icon,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { Order } from "./InventoryCatalog";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

interface HeadCell {
    disablePadding: boolean;
    id: keyof AVProduct | "actions";
    label: string;
    altLabel?: string;
    sortable: boolean;
    mobile: boolean;
}

export const headCells: readonly HeadCell[] = [
    {
        id: "name",
        disablePadding: true,
        label: "PRODUCT NAME",
        sortable: true,
        mobile: true,
    },
    {
        id: "productNo",
        disablePadding: false,
        label: "PRODUCT NUMBER",
        sortable: false,
        mobile: false,
    },
    {
        id: "stock",
        disablePadding: false,
        label: "STOCK",
        sortable: false,
        mobile: true,
    },
    {
        id: "reserved",
        disablePadding: false,
        label: "RESERVED",
        altLabel: "RES.",
        sortable: false,
        mobile: true,
    },
    {
        id: "available",
        disablePadding: false,
        label: "AVAILABLE",
        altLabel: "AVAIL.",
        sortable: false,
        mobile: true,
    },
    {
        id: "price",
        disablePadding: false,
        label: "PRICE",
        sortable: true,
        mobile: false,
    },
    {
        id: "category",
        disablePadding: false,
        label: "CATEGORY",
        sortable: false,
        mobile: false,
    },
    {
        id: "subCategory",
        disablePadding: false,
        label: "SUBCATEGORY",
        sortable: false,
        mobile: false,
    },
];

export interface EnhancedTableProps {
    numSelected: number;
    onRequestSort: (
        event: React.MouseEvent<unknown>,
        property: keyof AVProduct
    ) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

const InventoryCatalogHead: React.FC<EnhancedTableProps> = (props) => {
    const { order, orderBy, numSelected, rowCount, onRequestSort } = props;
    const { width } = useWindowSizeContext();
    const handleSort =
        (property: keyof AVProduct) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => {
                    if (headCell.mobile || (width && width >= 1000)) {
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
                                                : "asc"
                                        }
                                        onClick={handleSort(
                                            headCell.id as keyof AVProduct
                                        )}
                                    >
                                        {width &&
                                        width < 1000 &&
                                        headCell.altLabel
                                            ? headCell.altLabel
                                            : headCell.label}
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
                                    {width && width < 1000 && headCell.altLabel
                                        ? headCell.altLabel
                                        : headCell.label}
                                </TableCell>
                            );
                        }
                    }
                })}
                {width && width < 1000 && (
                    <TableCell
                        sx={{ width: "40px", position: "sticky", right: 0 }}
                    ></TableCell>
                )}
            </TableRow>
        </TableHead>
    );
};

export default InventoryCatalogHead;
