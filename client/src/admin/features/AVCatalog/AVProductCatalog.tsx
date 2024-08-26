import React, { useState } from "react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../hooks/reduxHooks";
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
import KeyboardArrowUpSharpIcon from "@mui/icons-material/KeyboardArrowUpSharp";
import KeyboardArrowDownSharpIcon from "@mui/icons-material/KeyboardArrowDownSharp";
import AVCatalogHead from "./AVCatalogHead";
import AVProductTableToolbar from "./AVProductTableToolbar";
import { AVProduct } from "./avCatalogTypes";
import MoreMenu from "./MoreMenu";
import { useNavigate, Link } from "react-router-dom";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";
import AVTableRow from "./AVTableRow";

interface AVCatProps {
    page: number;
    results: number;
    updateSearchParams: (newFilters: Record<string, string>) => void;
    handleProductActivate: (productNo: string) => void;
    handleProductDiscontinue: (productNo: string) => void;
    discontinueSelected: (productNos: string[]) => void;
    activateSelected: (productNos: string[]) => void;
}

export interface Row {
    id: string;
    thumbnailUrl: string;
    name: string;
    productNo: string;
    price: string;
    category: string;
    subCategory: string | null;
    tags: string;
    lastModified: string;
    createdAt: string;
    status: string;
}

export type Order = "asc" | "desc";

const AVProductCatalog: React.FC<AVCatProps> = ({
    page,
    results,
    updateSearchParams,
    handleProductActivate,
    handleProductDiscontinue,
    discontinueSelected,
    activateSelected,
}) => {
    const { products, numberOfResults, loading, error } = useAppSelector(
        (state: RootState) => state.avCatalog
    );
    const navigate = useNavigate();
    const [order, setOrder] = React.useState<Order>("asc");
    const [orderBy, setOrderBy] = React.useState<keyof AVProduct>("name");
    const [selected, setSelected] = React.useState<readonly string[]>([]);
    const [rowsPerPage, setRowsPerPage] = React.useState(24);
    const { width, isTouchDevice } = useWindowSizeContext();

    const rows = products.map((product) => {
        const rowData: Row = {
            id: product.productNo,
            thumbnailUrl: product.thumbnailUrl,
            name: product.name,
            productNo: product.productNo,
            price: `$${Number(product.price).toFixed(2)}`,
            category: product.category,
            subCategory: product.subCategory,
            tags: product.tags ? product.tags.join(",") : "",
            lastModified: product.lastModified,
            createdAt: product.createdAt,
            status: product.status,
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

    useEffect(() => {
        const apiOrder = order === "asc" ? "ascend" : "descend";
        const sortOption = `${orderBy}-${apiOrder}`;
        updateSearchParams({ sort: sortOption });
    }, [order, orderBy]);

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
        updateSearchParams({ page: String(newPage + 1) });
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 24));
        updateSearchParams({ page: "1", itemsPerPage: event.target.value });
    };

    const isSelected = (id: string) => selected.indexOf(id) !== -1;

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * 4 - rows.length) : 0;

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
                <AVProductTableToolbar
                    numSelected={selected.length}
                    selected={selected}
                    discontinueSelected={discontinueSelected}
                    activateSelected={activateSelected}
                />
                <TableContainer
                    sx={{
                        maxHeight:
                            width && width < 600
                                ? "calc(100dvh - 354px)"
                                : "70vh",
                    }}
                >
                    <Table
                        sx={
                            {
                                // minWidth: width && width >= 600 ? 750 : undefined,
                            }
                        }
                        aria-labelledby="tableTitle"
                        size={"medium"}
                        stickyHeader
                        aria-label="sticky table"
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
                            {rows.map((row, index) => (
                                <AVTableRow
                                    row={row}
                                    handleClick={handleClick}
                                    index={index}
                                    isSelected={isSelected}
                                    handleProductActivate={
                                        handleProductActivate
                                    }
                                    handleProductDiscontinue={
                                        handleProductDiscontinue
                                    }
                                    key={row.productNo}
                                />
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

export default AVProductCatalog;
