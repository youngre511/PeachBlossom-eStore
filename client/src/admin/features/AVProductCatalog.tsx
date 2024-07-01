import React from "react";
import { useEffect } from "react";
import { useAppSelector } from "../hooks/reduxHooks";
import { RootState } from "../store/store";
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
import AVCatalogHead from "./AVCatalogHead";
import AVProductTableToolbar from "./AVProductTableToolbar";
import { AVProduct } from "./avCatalogTypes";

interface AVCatProps {
    page: number;
    results: number;
}

interface Row {
    id: string;
    thumbnailUrl: string;
    name: string;
    productNo: string;
    price: string;
    category: string;
    subcategory: string | null;
    tags: string;
    lastModified: string;
    createdAt: string;
}

export type Order = "asc" | "desc";

const AVProductCatalog: React.FC<AVCatProps> = (props) => {
    const { products, numberOfResults, loading, error } = useAppSelector(
        (state: RootState) => state.avCatalog
    );
    const [order, setOrder] = React.useState<Order>("asc");
    const [orderBy, setOrderBy] = React.useState<keyof AVProduct>("name");
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(24);

    const rows = products.map((product) => {
        const rowData: Row = {
            id: product.productNo,
            thumbnailUrl: product.thumbnail,
            name: product.name,
            productNo: product.productNo,
            price: `$${product.price.toFixed(2)}`,
            category: product.category,
            subcategory: product.subcategory,
            tags: product.tags.join(","),
            lastModified: product.lastModified,
            createdAt: product.createdAt,
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

    const handleSelectAllClick = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (event.target.checked) {
            const newSelected = rows.map((n) => n.id);
            setSelected(newSelected);
            return;
        }
        setSelected([]);
    };

    const handleClick = (event: React.MouseEvent<unknown>, id: string) => {
        const selectedIndex = selected.indexOf(id);
        let newSelected: readonly string[] = [];

        if (selectedIndex === -1) {
            newSelected = newSelected.concat(selected, id);
        } else if (selectedIndex === 0) {
            newSelected = newSelected.concat(selected.slice(1));
        } else if (selectedIndex === selected.length - 1) {
            newSelected = newSelected.concat(selected.slice(0, -1));
        } else if (selectedIndex > 0) {
            newSelected = newSelected.concat(
                selected.slice(0, selectedIndex),
                selected.slice(selectedIndex + 1)
            );
        }
        setSelected(newSelected);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const isSelected = (id: string) => selected.indexOf(id) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows =
        page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
                <AVProductTableToolbar numSelected={selected.length} />
                <TableContainer>
                    <Table
                        sx={{ minWidth: 750 }}
                        aria-labelledby="tableTitle"
                        size={"medium"}
                    >
                        <AVCatalogHead
                            numSelected={selected.length}
                            order={order}
                            orderBy={orderBy}
                            onSelectAllClick={handleSelectAllClick}
                            onRequestSort={handleRequestSort}
                            rowCount={rows.length}
                        />
                        <TableBody>
                            {rows.map((row, index) => {
                                const isItemSelected = isSelected(row.id);
                                const labelId = `enhanced-table-checkbox-${index}`;

                                return (
                                    <TableRow
                                        hover
                                        onClick={(event) =>
                                            handleClick(event, row.id)
                                        }
                                        role="checkbox"
                                        aria-checked={isItemSelected}
                                        tabIndex={-1}
                                        key={row.id}
                                        selected={isItemSelected}
                                        sx={{ cursor: "pointer" }}
                                    >
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                color="primary"
                                                checked={isItemSelected}
                                                inputProps={{
                                                    "aria-labelledby": labelId,
                                                }}
                                            />
                                        </TableCell>
                                        <TableCell
                                            component="th"
                                            id={labelId}
                                            scope="row"
                                            padding="none"
                                        >
                                            {row.name}
                                        </TableCell>
                                        <TableCell
                                            component="th"
                                            id={labelId}
                                            scope="row"
                                            padding="none"
                                        >
                                            {row.name}
                                        </TableCell>
                                        <TableCell align="left">
                                            {row.productNo}
                                        </TableCell>
                                        <TableCell align="right">
                                            {row.price}
                                        </TableCell>
                                        <TableCell align="left">
                                            {row.category}
                                        </TableCell>
                                        <TableCell align="left">
                                            {row.subcategory}
                                        </TableCell>
                                        <TableCell align="left">
                                            {row.tags}
                                        </TableCell>
                                        <TableCell align="left">
                                            {row.lastModified}
                                        </TableCell>
                                        <TableCell align="left">
                                            {row.createdAt}
                                        </TableCell>
                                        <TableCell align="left">
                                            <Tooltip title="Edit">
                                                <IconButton>
                                                    <ModeEditSharpIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton>
                                                    <MoreVertSharpIcon />
                                                </IconButton>
                                            </Tooltip>
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
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                />
            </Paper>
        </Box>
    );
};

export default AVProductCatalog;
