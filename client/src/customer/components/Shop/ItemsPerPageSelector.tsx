import React, { useEffect, useState } from "react";
import { InputLabel, Select, SelectChangeEvent, MenuItem } from "@mui/material";
import { useAppSelector } from "../../hooks/reduxHooks";
import { RootState } from "../../store/customerStore";
import { setItemsPerPage } from "../../features/UserPreferences/userPreferencesSlice";

const inputStyle = {
    "&.MuiInputBase-root": {
        backgroundColor: "white",
        "&.MuiFilledInput-root": {
            backgroundColor: "white",
            "&.Mui-disabled": {
                backgroundColor: "peach.light",
            },
        },
    },
};

const ItemsPerPageSelector: React.FC = () => {
    const itemsPerPage = useAppSelector(
        (state: RootState) => state.userPreferences.itemsPerPage
    );
    const [currentItemsPerPage, setCurrentItemsPerPage] =
        useState<string>("24");
    const handleChange = (event: SelectChangeEvent<string>) => {
        const newItemsPerPage = +event.target.value;
        setCurrentItemsPerPage(event.target.value);
        setItemsPerPage(newItemsPerPage as 24 | 48 | 96);
    };

    useEffect(() => {
        setCurrentItemsPerPage(String(itemsPerPage));
    }, [itemsPerPage]);

    return (
        <div className="per-page-selector">
            <InputLabel id="ipp-select-label">Items per page</InputLabel>
            <Select
                labelId="ipp-select-label"
                id="ipp-selection"
                value={currentItemsPerPage}
                onChange={handleChange}
                sx={{ ...inputStyle, width: "110px" }}
            >
                <MenuItem value={"24"}>24</MenuItem>
                <MenuItem value={"48"}>48</MenuItem>
                <MenuItem value={"96"}>96</MenuItem>
            </Select>
        </div>
    );
};
export default ItemsPerPageSelector;
