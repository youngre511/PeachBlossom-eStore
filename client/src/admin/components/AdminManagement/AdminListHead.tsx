import React from "react";
import {
    TableCell,
    TableHead,
    TableRow,
    Box,
    TableSortLabel,
} from "@mui/material";
import { visuallyHidden } from "@mui/utils";
import { AdminUser } from "../../features/Users/userTypes";

interface HeadCell {
    disablePadding: boolean;
    id: keyof AdminUser | "actions";
    label: string;
    sortable: boolean;
}

export const headCells: readonly HeadCell[] = [
    {
        id: "user_id",
        disablePadding: true,
        label: "USER ID",
        sortable: true,
    },
    {
        id: "username",
        disablePadding: false,
        label: "USERNAME",
        sortable: true,
    },
    {
        id: "admin_id",
        disablePadding: false,
        label: "ADMIN ID",
        sortable: true,
    },
    {
        id: "accessLevel",
        disablePadding: false,
        label: "ACCESS LEVEL",
        sortable: false,
    },
    {
        id: "defaultPassword",
        disablePadding: false,
        label: "DEFAULT PASSWORD?",
        sortable: true,
    },
    {
        id: "actions",
        disablePadding: false,
        label: "",
        sortable: false,
    },
];

const AdminListHead: React.FC = () => {
    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => {
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
                })}
            </TableRow>
        </TableHead>
    );
};

export default AdminListHead;
