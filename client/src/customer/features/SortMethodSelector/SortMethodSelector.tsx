import React, { useState } from "react";
import { InputLabel, Select, SelectChangeEvent, MenuItem } from "@mui/material";

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

interface Props {
    sortMethod: string;
    updateSearchParams: (newFilters: Record<string, string>) => void;
}
const SortMethodSelector: React.FC<Props> = ({
    sortMethod,
    updateSearchParams,
}: Props) => {
    const [currentSortMethod, setCurrentSortMethod] =
        useState<string>(sortMethod);
    const handleChange = (event: SelectChangeEvent<string>) => {
        updateSearchParams({ sort: event.target.value as string });
        setCurrentSortMethod(event.target.value as string);
    };

    return (
        <div className="sort-selection-div">
            <InputLabel id="sort-select-label">Sort by</InputLabel>
            <Select
                labelId="sort-select-label"
                id="sort-selection"
                value={currentSortMethod}
                onChange={handleChange}
                sx={inputStyle}
            >
                <MenuItem value={"name-ascend"}>Alphabetical (A to Z)</MenuItem>
                <MenuItem value={"name-descend"}>
                    Alphabetical (Z to A)
                </MenuItem>
                <MenuItem value={"price-ascend"}>Price (Low to High)</MenuItem>
                <MenuItem value={"price-descend"}>Price (High to Low)</MenuItem>
            </Select>
        </div>
    );
};
export default SortMethodSelector;
