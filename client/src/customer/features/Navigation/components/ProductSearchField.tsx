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
    const { currentRoute, previousRoute } = useNavigationContext();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const path = `/shop?sort=name-ascend&page=1&search=${searchQuery.replace(
            " ",
            "%20"
        )}`;
        dispatch(
            logActivity({ activityType: "search", searchTerm: searchQuery })
        );
        navigate(path);
        setSearchQuery("");
    };

    return (
        <form onSubmit={(e) => handleSearch(e)}>
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
                        if (currentRoute && currentRoute.includes("/shop")) {
                            navigate("/shop?sort=name-ascend&page=1");
                        }
                    } else {
                        setSearchQuery(value);
                    }
                }}
                options={searchOptions}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Search Products"
                        variant="filled"
                        value={searchQuery}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            setSearchQuery(e.target.value);
                        }}
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
            <Button type="submit" style={{ display: "none" }} />
        </form>
    );
};
export default ProductSearchField;
