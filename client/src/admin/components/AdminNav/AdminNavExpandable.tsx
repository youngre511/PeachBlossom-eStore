import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    SvgIconProps,
} from "@mui/material";
import React, { ComponentType, ReactNode, SVGProps } from "react";
import { useEffect } from "react";
import ExpandMoreIconSharp from "@mui/icons-material/ExpandMoreSharp";
import { AdminExpandType } from "./NavDrawerContents";

interface AdminNavExpandableProps {
    id: AdminExpandType;
    text: string;
    expanded: AdminExpandType;
    handleExpand: (
        menu: AdminExpandType
    ) => (event: React.SyntheticEvent, newExpanded: boolean) => void;
    Icon:
        | React.ComponentType<SvgIconProps>
        | ComponentType<SVGProps<SVGSVGElement>>;
    children: ReactNode;
}
const AdminNavExpandable: React.FC<AdminNavExpandableProps> = ({
    id,
    text,
    expanded,
    handleExpand,
    Icon,
    children,
}) => {
    return (
        <ListItem disablePadding>
            <Accordion
                expanded={expanded === id}
                onChange={handleExpand(id)}
                disableGutters={true}
                square={true}
                sx={{
                    width: "100%",
                    boxShadow: "none",
                    bgcolor: "peach.extraDark",
                    color: "white",
                }}
            >
                <AccordionSummary expandIcon={<ExpandMoreIconSharp />} id={id}>
                    <ListItemIcon>
                        <Icon className="menu-svg" />
                    </ListItemIcon>
                    <ListItemText primary={text} />
                </AccordionSummary>
                <AccordionDetails
                    sx={{
                        padding: 0,
                        bgcolor: "peach.main",
                    }}
                >
                    <List>{children}</List>
                </AccordionDetails>
            </Accordion>
        </ListItem>
    );
};
export default AdminNavExpandable;
