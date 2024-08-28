import {
    Box,
    Checkbox,
    Collapse,
    IconButton,
    TableCell,
    TableRow,
    Tooltip,
    Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useEffect } from "react";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";
import { Link, useNavigate } from "react-router-dom";
import MoreMenu from "./MoreMenu";
import { Row } from "./AVProductCatalog";
import ModeEditSharpIcon from "@mui/icons-material/ModeEditSharp";
import KeyboardArrowUpSharpIcon from "@mui/icons-material/KeyboardArrowUpSharp";
import KeyboardArrowDownSharpIcon from "@mui/icons-material/KeyboardArrowDownSharp";

interface Props {
    row: Row;
    handleClick: (event: React.MouseEvent<unknown>, id: string) => void;
    index: number;
    isSelected: (id: string) => boolean;
    handleProductActivate: (productNo: string) => void;
    handleProductDiscontinue: (productNo: string) => void;
}
const AVTableRow: React.FC<Props> = ({
    row,
    handleClick,
    index,
    isSelected,
    handleProductActivate,
    handleProductDiscontinue,
}) => {
    const { width, isTouchDevice } = useWindowSizeContext();
    const [open, setOpen] = useState<boolean>(false);
    const isItemSelected = isSelected(row.id);
    const labelId = `enhanced-table-checkbox-${index}`;
    const navigate = useNavigate();

    return (
        <React.Fragment>
            <TableRow
                hover
                aria-checked={isItemSelected}
                tabIndex={-1}
                key={row.id}
                selected={isItemSelected}
                sx={{
                    cursor: "pointer",
                    backgroundColor:
                        row.status === "discontinued"
                            ? "darkgray"
                            : "undefined",
                }}
            >
                {width && width >= 800 && (
                    <TableCell padding="checkbox">
                        <Checkbox
                            color="primary"
                            onClick={(event) => handleClick(event, row.id)}
                            checked={isItemSelected}
                            inputProps={{
                                "aria-labelledby": labelId,
                            }}
                        />
                    </TableCell>
                )}
                <TableCell
                    id={labelId}
                    scope="row"
                    padding={width && width >= 800 ? "none" : undefined}
                >
                    <img
                        src={row.thumbnailUrl}
                        alt={row.name}
                        className={
                            row.status === "discontinued"
                                ? "admin-catalog-thumbnail grayscale-thumbnail"
                                : "admin-catalog-thumbnail"
                        }
                    />
                </TableCell>
                <TableCell
                    id={labelId}
                    scope="row"
                    padding="none"
                    sx={{ minWidth: 138 }}
                >
                    <Link
                        to={`/products/product-details?product=${row.productNo}`}
                    >
                        {row.name}
                    </Link>
                </TableCell>
                {width && width >= 800 && (
                    <React.Fragment>
                        <TableCell align="left" sx={{ minWidth: 162 }}>
                            {row.productNo}
                        </TableCell>
                        <TableCell align="right">
                            {row.status === "discontinued"
                                ? "discontinued"
                                : row.price}
                        </TableCell>
                        <TableCell align="left">{row.category}</TableCell>
                        <TableCell align="left">{row.subcategory}</TableCell>
                        {/* <TableCell align="left">{row.tags}</TableCell> */}
                        <TableCell align="left" sx={{ minWidth: 164 }}>
                            {row.lastModified}
                        </TableCell>
                        <TableCell align="left" sx={{ minWidth: 140 }}>
                            {row.createdAt}
                        </TableCell>
                    </React.Fragment>
                )}
                <TableCell
                    align="left"
                    scope="row"
                    sx={{
                        position: "sticky",
                        right: 0,
                        backgroundColor: "white",
                    }}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                        }}
                    >
                        {row.status !== "discontinued" &&
                            width &&
                            width >= 800 && (
                                <Tooltip title="Edit">
                                    <IconButton
                                        onClick={() =>
                                            navigate(
                                                `/products/product-details?product=${row.productNo}&editing=true`
                                            )
                                        }
                                    >
                                        <ModeEditSharpIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        <MoreMenu
                            productNo={row.productNo}
                            discontinued={row.status === "discontinued"}
                            handleProductActivate={handleProductActivate}
                            handleProductDiscontinue={handleProductDiscontinue}
                        />
                        {width && width < 800 && (
                            <IconButton
                                size="small"
                                onClick={() => setOpen(!open)}
                            >
                                {open ? (
                                    <KeyboardArrowUpSharpIcon />
                                ) : (
                                    <KeyboardArrowDownSharpIcon />
                                )}
                            </IconButton>
                        )}
                    </div>
                </TableCell>
            </TableRow>
            {width && width < 800 && (
                <TableRow>
                    <TableCell
                        style={{ paddingBottom: 0, paddingTop: 0 }}
                        colSpan={3}
                    >
                        <Collapse in={open} timeout="auto" unmountOnExit>
                            <Box margin={1}>
                                {/* Data that is hidden in the main row but appears in the collapsible section */}
                                <Typography variant="body2">
                                    <b>ProductNo:</b> {row.productNo}
                                </Typography>

                                <Typography variant="body2">
                                    <b>Price:</b>{" "}
                                    {row.status !== "discontinued"
                                        ? row.price
                                        : "N/A"}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Category:</b> {row.category}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Subcategory:</b> {row.subcategory}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Last Modified:</b> {row.lastModified}
                                </Typography>
                                <Typography variant="body2">
                                    <b>Created At:</b> {row.createdAt}
                                </Typography>
                            </Box>
                        </Collapse>
                    </TableCell>
                </TableRow>
            )}
        </React.Fragment>
    );
};
export default AVTableRow;
