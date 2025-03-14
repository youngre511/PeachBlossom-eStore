import { Box, Button } from "@mui/material";
import React from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProductActionButtonsProps {
    editMode: boolean;
    setIsConfirming: React.Dispatch<React.SetStateAction<boolean>>;
    setMustFetchData: React.Dispatch<React.SetStateAction<boolean>>;
    searchParams: URLSearchParams;
    setSearchParams: React.Dispatch<React.SetStateAction<URLSearchParams>>;
    accessLevel: string | undefined;
    previous: { path: string; name: string };
}
const ProductActionButtons: React.FC<ProductActionButtonsProps> = ({
    editMode,
    setIsConfirming,
    setMustFetchData,
    searchParams,
    setSearchParams,
    accessLevel,
    previous,
}) => {
    const navigate = useNavigate();

    return (
        <React.Fragment>
            <Button
                variant="outlined"
                sx={{
                    color: "black",
                    width: {
                        xs: "100%",

                        md: "auto",
                    },
                }}
                onClick={() => navigate(previous.path || "/products/manage")}
            >
                &lt; Back to {previous.name}
            </Button>
            {editMode && (
                <Box
                    className="edit-mode-buttons"
                    sx={{
                        mb: { xs: 2, md: 0 },
                        width: { xs: "100%", md: "auto" },
                    }}
                >
                    <Button
                        variant="contained"
                        onClick={() => setIsConfirming(true)}
                        disabled={accessLevel === "view only"}
                        sx={{
                            width: {
                                xs: "calc(50% - 10px)",
                                md: "auto",
                            },
                        }}
                    >
                        Save Changes
                    </Button>
                    <Button
                        sx={{
                            marginLeft: "20px",
                            width: {
                                xs: "calc(50% - 10px)",
                                md: "auto",
                            },
                        }}
                        variant="contained"
                        onClick={() => {
                            searchParams.delete("editing");
                            setSearchParams(searchParams);
                            setMustFetchData(true);
                        }}
                    >
                        Cancel
                    </Button>
                </Box>
            )}
            {accessLevel !== "view only" && !editMode && (
                <Button
                    variant="contained"
                    onClick={() => {
                        searchParams.set("editing", "true");
                        setSearchParams(searchParams);
                    }}
                    sx={{
                        mb: { xs: 2, md: 0 },
                        width: {
                            xs: "100%",

                            md: "auto",
                        },
                    }}
                >
                    Edit
                </Button>
            )}
        </React.Fragment>
    );
};
export default ProductActionButtons;
