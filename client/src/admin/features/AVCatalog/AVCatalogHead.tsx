import React from "react";
import { AVProduct } from "./avCatalogTypes";
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
import { Order } from "./AVProductCatalog";
import ImageSharpIcon from "@mui/icons-material/ImageSharp";

interface HeadCell {
    disablePadding: boolean;
    id: keyof AVProduct | "actions";
    label: string;
    sortable: boolean;
}

export const headCells: readonly HeadCell[] = [
    {
        id: "name",
        disablePadding: true,
        label: "PRODUCT NAME",
        sortable: true,
    },
    {
        id: "productNo",
        disablePadding: false,
        label: "PRODUCT NUMBER",
        sortable: false,
    },
    {
        id: "price",
        disablePadding: false,
        label: "PRICE",
        sortable: true,
    },
    {
        id: "category",
        disablePadding: false,
        label: "CATEGORY",
        sortable: false,
    },
    {
        id: "subCategory",
        disablePadding: false,
        label: "SUBCATEGORY",
        sortable: false,
    },
    {
        id: "lastModified",
        disablePadding: false,
        label: "LAST MODIFIED",
        sortable: true,
    },
    {
        id: "createdAt",
        disablePadding: false,
        label: "CREATED AT",
        sortable: true,
    },
    {
        id: "actions",
        disablePadding: false,
        label: "ACTIONS",
        sortable: false,
    },
];

export interface EnhancedTableProps {
    numSelected: number;
    onRequestSort: (
        event: React.MouseEvent<unknown>,
        property: keyof AVProduct
    ) => void;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    order: Order;
    orderBy: string;
    rowCount: number;
}

const AVCatalogHead: React.FC<EnhancedTableProps> = (props) => {
    const {
        onSelectAllClick,
        order,
        orderBy,
        numSelected,
        rowCount,
        onRequestSort,
    } = props;

    const handleSort =
        (property: keyof AVProduct) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        indeterminate={
                            numSelected > 0 && numSelected < rowCount
                        }
                        checked={rowCount > 0 && numSelected === rowCount}
                        onChange={onSelectAllClick}
                        inputProps={{
                            "aria-label": "select all products",
                        }}
                    />
                </TableCell>
                <TableCell>
                    <Icon>
                        <ImageSharpIcon />
                    </Icon>
                </TableCell>
                {headCells.map((headCell) => {
                    if (headCell.sortable) {
                        return (
                            <TableCell
                                key={headCell.id}
                                align={"left"}
                                padding={
                                    headCell.disablePadding ? "none" : "normal"
                                }
                                sortDirection={
                                    orderBy === headCell.id ? order : false
                                }
                            >
                                <TableSortLabel
                                    active={orderBy === headCell.id}
                                    direction={
                                        orderBy === headCell.id ? order : "asc"
                                    }
                                    onClick={handleSort(
                                        headCell.id as keyof AVProduct
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

export default AVCatalogHead;
