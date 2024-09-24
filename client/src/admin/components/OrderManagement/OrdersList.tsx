import React from "react";
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
} from "@mui/material";

import MoreVertSharpIcon from "@mui/icons-material/MoreVertSharp";
import ImageSharpIcon from "@mui/icons-material/ImageSharp";
import ModeEditSharpIcon from "@mui/icons-material/ModeEditSharp";
import AddAPhotoSharpIcon from "@mui/icons-material/AddAPhotoSharp";
import OrdersListHead from "./OrdersListHead";
import { IAVOrder } from "../../features/AVOrders/avOrdersTypes";
import { useNavigate } from "react-router-dom";
import OrderListRow from "./OrderListRow";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

interface AVCatProps {
    page: number;
    results: IAVOrder[];
    numberOfResults: number;
    updateSearchParams: (newFilters: Record<string, string>) => void;
}

export interface OrderRow {
    orderNo: string;
    orderDate: string;
    total: string;
    shippingAddress: string;
    state: string;
    email: string;
    orderStatus: string;
}

export type Order = "asc" | "desc";

const OrdersList: React.FC<AVCatProps> = ({
    page,
    results,
    numberOfResults,
    updateSearchParams,
}) => {
    const [order, setOrder] = React.useState<Order>("desc");
    const [orderBy, setOrderBy] = React.useState<keyof IAVOrder>("orderDate");
    const [rowsPerPage, setRowsPerPage] = React.useState(24);
    const navigate = useNavigate();
    const { width } = useWindowSizeContext();

    const rows = results.map((order) => {
        const rowData: OrderRow = {
            orderNo: order.orderNo,
            orderDate: order.orderDate.toLocaleString(),
            total: `$${Number(order.totalAmount).toFixed(2)}`,
            //If shipping address has a second part, replace the spaced-pipe connector with a comma, otherwise, use only the first part.
            shippingAddress: order.shippingAddress.split(" | ")[1]
                ? order.shippingAddress.replace(" |", ",")
                : order.shippingAddress.split(" | ")[0],
            state: order.stateAbbr,
            email: order.email.toLowerCase(),
            orderStatus: order.orderStatus,
        };
        return rowData;
    });

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof IAVOrder
    ) => {
        const isAsc = orderBy === property && order === "asc";
        setOrder(isAsc ? "desc" : "asc");
        setOrderBy(property);
    };

    useEffect(() => {
        const apiOrder = order === "asc" ? "ascend" : "descend";
        const sortOption = `${orderBy}-${apiOrder}`;
        updateSearchParams({ sort: sortOption });
    }, [order, orderBy]);

    const handleChangePage = (event: unknown, newPage: number) => {
        updateSearchParams({ page: String(newPage + 1) });
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(+event.target.value);
        updateSearchParams({ page: "1", itemsPerPage: event.target.value });
    };

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * 4 - rows.length) : 0;

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
                <TableContainer
                    sx={{
                        maxHeight:
                            width && width < 800
                                ? "calc(100vh - 320px)"
                                : "70dvh",
                    }}
                >
                    <Table
                        sx={{ paddingLeft: "20px" }}
                        aria-labelledby="tableTitle"
                        size={"medium"}
                        stickyHeader
                        aria-label="sticky table"
                    >
                        <OrdersListHead
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                        />
                        <TableBody>
                            {rows.map((row, index) => (
                                <OrderListRow row={row} key={row.orderNo} />
                            ))}
                            {emptyRows > 0 && (
                                <TableRow
                                    style={{
                                        height: 53 * emptyRows,
                                    }}
                                >
                                    <TableCell colSpan={6} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    rowsPerPageOptions={[24, 48, 96]}
                    component="div"
                    count={numberOfResults}
                    rowsPerPage={rowsPerPage}
                    page={page - 1}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
};

export default OrdersList;
