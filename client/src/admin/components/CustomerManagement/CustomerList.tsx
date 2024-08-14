import React from "react";
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

import CustomerListHead from "./CustomerListHead";
import { useNavigate } from "react-router-dom";
import { CustomerUser } from "../../features/Users/userTypes";
import CustomerMoreMenu from "./customerMoreMenu";
import { deleteUser, resetUserPassword } from "../../features/Users/userSlice";
import axios from "axios";

interface AdminListProps {
    page: number;
    results: CustomerUser[];
    numberOfResults: number;
    updateSearchParams: (newFilters: Record<string, string>) => void;
    handleResetPassword: (user_id: number) => void;
    handleUserDelete: (user_id: number) => void;
}

interface Row {
    user_id: number;
    username: string;
    customer_id: number;
    email: string;
    defaultPassword: boolean;
}

const CustomerList: React.FC<AdminListProps> = ({
    page,
    results,
    numberOfResults,
    updateSearchParams,
    handleResetPassword,
    handleUserDelete,
}) => {
    const [rowsPerPage, setRowsPerPage] = React.useState(24);
    const navigate = useNavigate();

    const rows = results.map((user) => {
        const rowData: Row = {
            user_id: user.user_id,
            username: user.username,
            customer_id: user.customer_id,
            email: user.email,
            defaultPassword: user.defaultPassword,
        };
        return rowData;
    });

    const handleChangePage = (event: unknown, newPage: number) => {
        updateSearchParams({ page: String(newPage + 1) });
    };

    const handleChangeRowsPerPage = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 24));
        updateSearchParams({
            page: "1",
            itemsPerPage: String(event.target.value),
        });
    };

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * 4 - rows.length) : 0;

    return (
        <Box sx={{ width: "100%" }}>
            <Paper sx={{ width: "100%", mb: 2 }}>
                <TableContainer sx={{ maxHeight: 500 }}>
                    <Table
                        sx={{ minWidth: 750, paddingLeft: "20px" }}
                        aria-labelledby="tableTitle"
                        size={"medium"}
                        stickyHeader
                        aria-label="sticky table"
                    >
                        <CustomerListHead />
                        <TableBody>
                            {rows.map((row, index) => {
                                return (
                                    <TableRow
                                        hover
                                        tabIndex={-1}
                                        key={row.user_id}
                                    >
                                        <TableCell align="left">
                                            {row.user_id}
                                        </TableCell>
                                        <TableCell align="left">
                                            {row.username}
                                        </TableCell>
                                        <TableCell align="left">
                                            {row.customer_id}
                                        </TableCell>
                                        <TableCell align="left">
                                            {row.email}
                                        </TableCell>
                                        <TableCell align="left">
                                            {String(row.defaultPassword)}
                                        </TableCell>
                                        <TableCell align="left">
                                            {/* {row.username !== "youngre511" && (
                                                <CustomerMoreMenu
                                                    user_id={row.user_id}
                                                    username={row.username}
                                                    currentAccessLevel={
                                                        row.accessLevel
                                                    }
                                                    isDefaultPassword={
                                                        row.defaultPassword
                                                    }
                                                    handleResetPassword={
                                                        handleResetPassword
                                                    }
                                                    handleUserDelete={
                                                        handleUserDelete
                                                    }
                                                    handleChangeAccessLevel={
                                                        handleChangeAccessLevel
                                                    }
                                                />
                                            )} */}
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

export default CustomerList;
