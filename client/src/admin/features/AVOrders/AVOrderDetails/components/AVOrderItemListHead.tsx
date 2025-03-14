import React, { useEffect } from "react";
import { TableCell, TableHead, TableRow, Checkbox } from "@mui/material";
import { useWindowSizeContext } from "../../../../../common/contexts/windowSizeContext";

interface HeadCell {
    disablePadding: boolean;
    id: string;
    label: string;
    mobile: boolean;
}

export const headCells: readonly HeadCell[] = [
    {
        id: "productNo",
        disablePadding: true,
        label: "PRODUCT NUMBER",
        mobile: true,
    },
    {
        id: "productName",
        disablePadding: false,
        label: "PRODUCT NAME",
        mobile: false,
    },
    {
        id: "priceWhenOrdered",
        disablePadding: false,
        label: "PRICE",
        mobile: false,
    },
    {
        id: "quantity",
        disablePadding: false,
        label: "QUANTITY",
        mobile: true,
    },
    {
        id: "itemTotal",
        disablePadding: false,
        label: "ITEM TOTAL",
        mobile: false,
    },
    {
        id: "fulfillmentStatus",
        disablePadding: false,
        label: "STATUS",
        mobile: true,
    },
];

export interface EnhancedTableProps {
    numSelected: number;
    onSelectAllClick: (event: React.ChangeEvent<HTMLInputElement>) => void;
    rowCount: number;
    cancelledRowCount: number;
    editMode: boolean;
}

const AVOrderItemListHead: React.FC<EnhancedTableProps> = (props) => {
    const {
        onSelectAllClick,
        numSelected,
        rowCount,
        cancelledRowCount,
        editMode,
    } = props;
    const { width } = useWindowSizeContext();

    useEffect(() => {
        if ((width && width < 1000) || !editMode) {
            headCells[0].disablePadding = false;
        } else {
            headCells[0].disablePadding = true;
        }
    }, [width, editMode]);

    return (
        <TableHead>
            <TableRow>
                {width && width >= 1000 && editMode && (
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
                )}
                {headCells.map((headCell) => {
                    if ((width && width >= 1000) || headCell.mobile) {
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
                {width && width < 1000 && (
                    <TableCell
                        sx={{
                            backgroundColor: "white",
                            position: "sticky",
                            right: 0,
                        }}
                    ></TableCell>
                )}
            </TableRow>
        </TableHead>
    );
};

export default AVOrderItemListHead;
