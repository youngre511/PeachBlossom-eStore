import {
    TextField,
    Button,
    InputAdornment,
    SvgIcon,
    Autocomplete,
} from "@mui/material";
import React from "react";
import { ChangeEvent, FormEvent, useState, ComponentProps } from "react";
import SearchSharpIcon from "@mui/icons-material/SearchSharp";

interface Props {
    updateSearchParams: (newFilters: Record<string, string>) => void;
    sx?: ComponentProps<typeof TextField>["sx"];
    inputSx?: ComponentProps<typeof TextField>["sx"];
    options: string[];
}
const SearchField: React.FC<Props> = ({
    updateSearchParams,
    sx,
    inputSx,
    options,
}) => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const optionsArray = [];
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        updateSearchParams({ search: searchQuery });
    };
    return (
        <React.Fragment>
            <form onSubmit={handleSubmit}>
                <Autocomplete
                    freeSolo
                    id="search-bar"
                    onInputChange={(
                        e: React.SyntheticEvent,
                        value: string,
                        reason: string
                    ) => {
                        if (reason === "clear") {
                            setSearchQuery("");
                            updateSearchParams({ search: "" });
                        }
                    }}
                    filterOptions={(options) => {
                        const inputValue = searchQuery.toLowerCase();
                        return searchQuery.length >= 2
                            ? options.filter((option) =>
                                  option.toLowerCase().includes(inputValue)
                              )
                            : [];
                    }}
                    options={options}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label="Search"
                            variant="outlined"
                            value={searchQuery}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                setSearchQuery(e.target.value)
                            }
                            fullWidth
                            InputProps={{
                                ...params.InputProps,
                                type: "search",
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SvgIcon>
                                            <SearchSharpIcon />
                                        </SvgIcon>
                                    </InputAdornment>
                                ),
                            }}
                            sx={sx}
                            inputProps={{
                                ...params.inputProps,
                                sx: inputSx,
                                inputMode: "search",
                            }}
                        />
                    )}
                />
                <Button type="submit" style={{ display: "none" }} />
            </form>
        </React.Fragment>
    );
};
export default SearchField;
