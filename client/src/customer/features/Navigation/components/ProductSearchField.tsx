import { Autocomplete, Button, TextField } from "@mui/material";
import React, { ChangeEvent, SetStateAction } from "react";
import { useNavigationContext } from "../../../../common/contexts/navContext";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "../../../hooks/reduxHooks";
import { logActivity } from "../../../store/userData/userDataTrackingThunks";

interface ProductSearchFieldProps {
    searchQuery: string;
    setSearchQuery: React.Dispatch<SetStateAction<string>>;
    searchOptions: Array<string>;
}
const ProductSearchField: React.FC<ProductSearchFieldProps> = ({
    searchQuery,
    setSearchQuery,
    searchOptions,
}) => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const executeSearch = (query: string | null) => {
        if (query) {
            dispatch(
                logActivity({ activityType: "search", searchTerm: query })
            );
            query.replace(" ", "%20");
        }
        const path = `/shop?sort=name-ascend&page=1${
            query && query !== "" ? `&search=${query}` : ""
        }`;
        navigate(path);
        setSearchQuery("");
    };

    return (
        <Autocomplete
            freeSolo
            id="product-search"
            filterOptions={(searchOptions) => {
                const inputValue = searchQuery.toLowerCase();
                return searchQuery.length >= 2
                    ? searchOptions.filter((option) =>
                          option.toLowerCase().includes(inputValue)
                      )
                    : [];
            }}
            onInputChange={(
                e: React.SyntheticEvent,
                value: string,
                reason: string
            ) => {
                if (reason === "clear") {
                    setSearchQuery("");
                } else {
                    setSearchQuery(value);
                }
            }}
            onChange={(_event, selectedOption) => {
                if (selectedOption) {
                    setSearchQuery(selectedOption);
                }
                executeSearch(selectedOption);
            }}
            options={searchOptions}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Search Products"
                    variant="filled"
                    value={searchQuery}
                    fullWidth
                    sx={{
                        backgroundColor: "white",
                    }}
                    size="small"
                    slotProps={{
                        input: {
                            ...params.InputProps,
                            type: "search",
                        },
                        htmlInput: {
                            ...params.inputProps,
                            inputMode: "search",
                        },
                    }}
                />
            )}
        />
    );
};
export default ProductSearchField;
