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
import AVCatalogHead from "./InventoryCatalogHead";
import { AVProduct } from "../../features/AVCatalog/avCatalogTypes";
import StockField from "./StockField";

interface AVCatProps {
    page: number;
    results: number;
    updateSearchParams: (newFilters: Record<string, string>) => void;
    pendingInventoryUpdates: Record<string, number>;
    setPendingInventoryUpdates: React.Dispatch<
        React.SetStateAction<Record<string, number>>
    >;
}

interface Row {
    id: string;
    name: string;
    productNo: string;
    stock: number;
    reserved: number;
    available: number;
    price: string;
    category: string;
    subCategory: string | null;
}

export type Order = "asc" | "desc";

const InventoryCatalog: React.FC<AVCatProps> = ({
    page,
    results,
    updateSearchParams,
    pendingInventoryUpdates,
    setPendingInventoryUpdates,
}) => {
    const { products, numberOfResults, loading, error } = useAppSelector(
        (state: RootState) => state.avCatalog
    );
    const [order, setOrder] = React.useState<Order>("asc");
    const [orderBy, setOrderBy] = React.useState<keyof AVProduct>("name");
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    // const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(24);

    const rows = products.map((product) => {
        const rowData: Row = {
            id: product.productNo,
            name: product.name,
            productNo: product.productNo,
            stock: product.stock,
            reserved: product.reserved,
            available: product.available,
            price: `$${Number(product.price).toFixed(2)}`,
            category: product.category,
            subCategory: product.subCategory,
        };
        return rowData;
    });

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof AVProduct
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
        setRowsPerPage(parseInt(event.target.value, 24));
        updateSearchParams({ page: "1", itemsPerPage: event.target.value });
    };

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750, paddingLeft: "20px" }}
                        aria-labelledby="tableTitle"
                        size={"medium"}
                    >
                        <AVCatalogHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                        />
                        <TableBody>
                            {rows.map((row, index) => {
                                const stockAmount: number =
                                    pendingInventoryUpdates[row.productNo] ??
                                    row.stock;
                                return (
                                    <TableRow hover tabIndex={-1} key={row.id}>
                                        <TableCell component="th" scope="row">
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="left">
                                            {row.productNo}
                                        </TableCell>
                                        <TableCell align="right">
                                            <div className="stock-input">
                                                <StockField
                                                    value={String(stockAmount)}
                                                    productNo={row.productNo}
                                                    setPendingInventoryUpdates={
                                                        setPendingInventoryUpdates
                                                    }
                                                    pendingInventoryUpdates={
                                                        pendingInventoryUpdates
                                                    }
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.reserved}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.available}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.price}
                                        </TableCell>
                                        <TableCell align="left">
                                            {row.category}
                                        </TableCell>
                                        <TableCell align="left">
                                            {row.subCategory}
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
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
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page - 1}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
};

export default InventoryCatalog;
