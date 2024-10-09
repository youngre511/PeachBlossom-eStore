import {
    Box,
    Collapse,
    IconButton,
    TableCell,
    TableRow,
    Typography,
} from "@mui/material";
import React, { useState } from "react";

import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";
import { useNavigate } from "react-router-dom";
import { InventoryRow } from "./InventoryCatalog";

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
                <TableCell
                    scope="row"
                    sx={{
                        minWidth: 170,
                        borderBottom:
                            width && width < 1000 && !open
                                ? "1px solid rgba(224, 224, 224, 0);"
                                : undefined,
                        transition: "border .3s ease-out",
                    }}
                >
                    {row.name}
                </TableCell>
                {width && width >= 1000 && (
                    <TableCell align="left" sx={{ minWidth: "162px" }}>
                        {row.productNo}
                    </TableCell>
                )}
                <TableCell
                    align="right"
                    sx={{
                        minWidth: "92px",
                        borderBottom:
                            width && width < 1000 && !open
                                ? "1px solid rgba(224, 224, 224, 0);"
                                : undefined,
                        transition: "border .3s ease-out",
                    }}
                >
                    <div className="stock-input">
                        <StockField
                            value={String(stockAmount)}
                            style={{ width: "80px" }}
                            productNo={row.productNo}
                            setPendingInventoryUpdates={
                                setPendingInventoryUpdates
                            }
                            pendingInventoryUpdates={pendingInventoryUpdates}
                        />
                    </div>
                </TableCell>
                <TableCell
                    align="right"
                    sx={
                        width && width < 1000 && !open
                            ? {
                                  borderBottom:
                                      "1px solid rgba(224, 224, 224, 0);",
                                  transition: "border .28s ease-out",
                              }
                            : {}
                    }
                >
                    {row.reserved}
                </TableCell>
                <TableCell
                    align="right"
                    sx={
                        width && width < 1000 && !open
                            ? {
                                  borderBottom:
                                      "1px solid rgba(224, 224, 224, 0);",
                                  transition: "border .28s ease-out",
                              }
                            : {}
                    }
                >
                    {row.available}
                </TableCell>
                {width && width >= 1000 ? (
                    <React.Fragment>
                        <TableCell align="right">{row.price}</TableCell>
                        <TableCell align="left">{row.category}</TableCell>
                        <TableCell align="left">{row.subcategory}</TableCell>
                    </React.Fragment>
                ) : (
                    <TableCell
                        sx={{
                            position: "sticky",
                            right: 0,
                            backgroundColor: "white",
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
                        colSpan={5}
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
                                    <b>Subcategory:</b> {row.subcategory}
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
