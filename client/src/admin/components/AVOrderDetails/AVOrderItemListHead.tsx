import React from "react";
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
import { AVOrderItem } from "./AVOrderDetails";

interface HeadCell {
    disablePadding: boolean;
    id: string;
    label: string;
}

export const headCells: readonly HeadCell[] = [
    {
        id: "productNo",
        disablePadding: true,
        label: "PRODUCT NUMBER",
    },
    {
        id: "productName",
        disablePadding: false,
        label: "PRODUCT NAME",
    },
    {
        id: "priceWhenOrdered",
        disablePadding: false,
        label: "PRICE",
    },
    {
        id: "quantity",
        disablePadding: false,
        label: "QUANTITY",
    },
    {
        id: "itemTotal",
        disablePadding: false,
        label: "ITEM TOTAL",
    },
    {
        id: "fulfillmentStatus",
        disablePadding: false,
        label: "STATUS",
    },
];

export interface EnhancedTableProps {
    numSelected: number;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    rowCount: number;
    cancelledRowCount: number;
}

const AVOrderItemListHead: React.FC<EnhancedTableProps> = (props) => {
    const { onSelectAllClick, numSelected, rowCount, cancelledRowCount } =
        props;

    return (
        <TableHead>
            <TableRow>
                <TableCell padding="checkbox">
                    <Checkbox
                        color="primary"
                        indeterminate={
                            numSelected > 0 &&
                            numSelected < rowCount - cancelledRowCount
                        }
                        checked={
                            rowCount > 0 &&
                            numSelected + cancelledRowCount === rowCount
                        }
                        onChange={onSelectAllClick}
                        inputProps={{
                            "aria-label": "select all products",
                        }}
                    />
                </TableCell>

                {headCells.map((headCell) => {
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
                })}
            </TableRow>
        </TableHead>
    );
};

export default AVOrderItemListHead;
