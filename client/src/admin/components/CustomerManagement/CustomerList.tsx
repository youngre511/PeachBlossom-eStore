import React from "react";

import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TablePagination,
    TableRow,
    Box,
} from "@mui/material";

import CustomerListHead from "./CustomerListHead";
import { useNavigate } from "react-router-dom";
import { CustomerUser } from "../../features/Users/userTypes";
import CustomerListRow from "./CustomerListRow";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

interface CustomerListProps {
    page: number;
    results: CustomerUser[];
    numberOfResults: number;
    updateSearchParams: (newFilters: Record<string, string>) => void;
    handleResetPassword: (user_id: number) => void;
    handleUserDelete: (user_id: number) => void;
}

export interface CustomerRow {
    user_id: number;
    username: string;
    customer_id: number;
    email: string;
    totalOrders: number;
    totalSpent: number;
    defaultPassword: boolean;
}

const CustomerList: React.FC<CustomerListProps> = ({
    page,
    results,
    numberOfResults,
    updateSearchParams,
    handleResetPassword,
    handleUserDelete,
}) => {
    const [rowsPerPage, setRowsPerPage] = React.useState(24);
    const { width } = useWindowSizeContext();

    const rows = results.map((user) => {
        const rowData: CustomerRow = {
            user_id: user.user_id,
            username: user.username,
            customer_id: user.customer_id,
            email: user.email,
            totalOrders: user.totalOrders,
            totalSpent: user.totalSpent,
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
        setRowsPerPage(+event.target.value);
        updateSearchParams({
            page: "1",
            usersPerPage: String(event.target.value),
        });
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
                        <CustomerListHead />
                        <TableBody>
                            {rows.map((row, index) => (
                                <CustomerListRow
                                    row={row}
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

export default CustomerList;
