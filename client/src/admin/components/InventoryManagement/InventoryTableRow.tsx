import {
    Box,
    Checkbox,
    Collapse,
    IconButton,
    TableCell,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useEffect } from "react";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";
import { Link, useNavigate } from "react-router-dom";
import { InventoryRow } from "./InventoryCatalog";
import ModeEditSharpIcon from "@mui/icons-material/ModeEditSharp";
import KeyboardArrowUpSharpIcon from "@mui/icons-material/KeyboardArrowUpSharp";
import KeyboardArrowDownSharpIcon from "@mui/icons-material/KeyboardArrowDownSharp";
import StockField from "./StockField";

interface Props {
    row: InventoryRow;
    pendingInventoryUpdates: Record<string, number>;
    setPendingInventoryUpdates: React.Dispatch<
        React.SetStateAction<Record<string, number>>
    >;
}
const InventoryTableRow: React.FC<Props> = ({
    row,
    pendingInventoryUpdates,
    setPendingInventoryUpdates,
}) => {
    const { width, isTouchDevice } = useWindowSizeContext();
    const [open, setOpen] = useState<boolean>(false);

    const navigate = useNavigate();
    const stockAmount: number =
        pendingInventoryUpdates[row.productNo] ?? row.stock;

    return (
        <React.Fragment>
            <TableRow hover tabIndex={-1}>
                <TableCell scope="row" sx={{ minWidth: 170 }}>
                    {row.name}
                </TableCell>
                {width && width >= 1000 && (
                    <TableCell align="left" sx={{ minWidth: "162px" }}>
                        {row.productNo}
                    </TableCell>
                )}
                <TableCell align="right" sx={{ minWidth: "92px" }}>
                    <div className="stock-input">
                        <StockField
                            value={String(stockAmount)}
                            productNo={row.productNo}
                            setPendingInventoryUpdates={
                                setPendingInventoryUpdates
                            }
                            pendingInventoryUpdates={pendingInventoryUpdates}
                        />
                    </div>
                </TableCell>
                <TableCell align="right">{row.reserved}</TableCell>
                <TableCell align="right">{row.available}</TableCell>
                {width && width >= 1000 ? (
                    <React.Fragment>
                        <TableCell align="right">{row.price}</TableCell>
                        <TableCell align="left">{row.category}</TableCell>
                        <TableCell align="left">{row.subCategory}</TableCell>
                    </React.Fragment>
                ) : (
                    <TableCell
                        sx={{
                            position: "sticky",
                            right: 0,
                            backgroundColor: "white",
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
                        colSpan={3}
                    >
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box margin={1}>
                                {/* Data that is hidden in the main row but appears in the collapsible section */}
                                <Typography variant="body2">
                                    <b>ProductNo:</b> {row.productNo}
                                </Typography>

                                <Typography variant="body2">
                                    <b>Price:</b>
                                    {row.price}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Category:</b> {row.category}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Subcategory:</b> {row.subCategory}
                                </Typography>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
};
export default InventoryTableRow;
