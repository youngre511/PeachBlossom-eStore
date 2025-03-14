import React from "react";
import { TableCell, TableHead, TableRow } from "@mui/material";
import { AdminUser } from "../userTypes";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";

interface HeadCell {
    disablePadding: boolean;
    id: keyof AdminUser | "actions";
    label: string;
    sortable: boolean;
    mobile: boolean;
}

export const headCells: readonly HeadCell[] = [
    {
        id: "user_id",
        disablePadding: true,
        label: "USER ID",
        sortable: true,
        mobile: false,
    },
    {
        id: "username",
        disablePadding: false,
        label: "USERNAME",
        sortable: true,
        mobile: true,
    },
    {
        id: "admin_id",
        disablePadding: false,
        label: "ADMIN ID",
        sortable: true,
        mobile: false,
    },
    {
        id: "accessLevel",
        disablePadding: false,
        label: "ACCESS LEVEL",
        sortable: false,
        mobile: true,
    },
    {
        id: "defaultPassword",
        disablePadding: false,
        label: "DEFAULT PASSWORD?",
        sortable: true,
        mobile: false,
    },
];

const AdminListHead: React.FC = () => {
    const { width } = useWindowSizeContext();
    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => {
                    if (headCell.mobile || (width && width >= 800)) {
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
                    }
                })}
                <TableCell
                    align={"right"}
                    padding={"normal"}
                    sx={{
                        backgroundColor: "white",
                        position: "sticky",
                        right: 0,
                    }}
                >
                    ACTIONS
                </TableCell>
            </TableRow>
        </TableHead>
    );
};

export default AdminListHead;
