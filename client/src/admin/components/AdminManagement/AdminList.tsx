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

import AdminListHead from "./AdminListHead";
import { IAVOrder } from "../../features/AVOrders/avOrdersTypes";
import { useNavigate } from "react-router-dom";
import { AdminUser } from "../../features/Users/userTypes";
import AdminMoreMenu from "./AdminMoreMenu";
import { deleteUser, resetUserPassword } from "../../features/Users/userSlice";
import axios from "axios";
import AdminListRow from "./AdminListRow";

interface AdminListProps {
    page: number;
    results: AdminUser[];
    numberOfResults: number;
    updateSearchParams: (newFilters: Record<string, string>) => void;
    handleResetPassword: (user_id: number) => void;
    handleUserDelete: (user_id: number) => void;
    handleChangeAccessLevel: (
        username: string,
        oldAccessLevel: "full" | "limited" | "view only",
        newAccessLevel: "full" | "limited" | "view only"
    ) => void;
}

export interface AdminRow {
    user_id: number;
    username: string;
    admin_id: number;
    accessLevel: "full" | "limited" | "view only";
    defaultPassword: boolean;
}

const AdminList: React.FC<AdminListProps> = ({
    page,
    results,
    numberOfResults,
    updateSearchParams,
    handleResetPassword,
    handleUserDelete,
    handleChangeAccessLevel,
}) => {
    const [rowsPerPage, setRowsPerPage] = React.useState(24);
    const navigate = useNavigate();

    const rows = results.map((user) => {
        const rowData: AdminRow = {
            user_id: user.user_id,
            username: user.username,
            admin_id: user.admin_id,
            accessLevel: user.accessLevel,
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
                        sx={{ paddingLeft: "20px" }}
                        aria-labelledby="tableTitle"
                        size={"medium"}
                        stickyHeader
                        aria-label="sticky table"
                    >
                        <AdminListHead />
                        <TableBody>
                            {rows.map((row, index) => (
                                <AdminListRow
                                    row={row}
                                    handleChangeAccessLevel={
                                        handleChangeAccessLevel
                                    }
                                    handleResetPassword={handleResetPassword}
                                    handleUserDelete={handleUserDelete}
                                    key={row.username}
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

export default AdminList;
