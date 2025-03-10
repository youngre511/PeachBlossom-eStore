import { Box, Button, Checkbox } from "@mui/material";
import React, { SetStateAction } from "react";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import CustomEmptyCheckbox from "../../../../common/components/CustomEmptyCheckbox";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";

interface CheckoutNavButtonsProps {
    activeStep: number;
    numberOfSteps: number;
    loggedIn: boolean | undefined;
    addNew: boolean;
    handleBack: () => void;
    handleNext: () => void;
    nextDisabled: boolean;
    saveAddress: boolean;
    setSaveAddress: React.Dispatch<SetStateAction<boolean>>;
}
const CheckoutNavButtons: React.FC<CheckoutNavButtonsProps> = ({
    activeStep,
    numberOfSteps,
    loggedIn,
    addNew,
    handleBack,
    handleNext,
    nextDisabled,
    saveAddress,
    setSaveAddress,
}) => {
    const { width } = useWindowSizeContext();
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: {
                    xs:
                        activeStep === 0 && addNew && loggedIn
                            ? "column"
                            : "column-reverse",
                    sm: "row",
                },
                justifyContent:
                    activeStep !== 0 || (addNew && loggedIn)
                        ? "space-between"
                        : "flex-end",
                alignItems: {
                    xs:
                        activeStep === 0 && addNew && loggedIn
                            ? "start"
                            : "end",
                    sm: "end",
                },
                flexGrow: 1,
                gap: 1,
                pb: { xs: 6, sm: 0 },
                mt: {
                    xs: activeStep === 0 && addNew && loggedIn ? 0 : 2,
                    sm: 0,
                },
                mb: { xs: 0, md: "60px" },
            }}
        >
            {activeStep !== 0 && (
                <Button
                    startIcon={<ChevronLeftRoundedIcon />}
                    onClick={handleBack}
                    variant={width && width >= 600 ? "text" : "outlined"}
                    fullWidth={width && width < 600 ? true : false}
                    sx={{
                        display: "flex",
                    }}
                >
                    Previous
                </Button>
            )}
            {activeStep === 0 && addNew && loggedIn && (
                <div className="save-address">
                    <Checkbox
                        checked={saveAddress}
                        inputProps={{
                            "aria-label": "controlled",
                        }}
                        icon={<CustomEmptyCheckbox />}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setSaveAddress(e.target.checked)
                        }
                    />
                    <div>Save Address</div>
                </div>
            )}
            <Button
                variant="contained"
                endIcon={<ChevronRightRoundedIcon />}
                onClick={handleNext}
                sx={{
                    width: {
                        xs: "100%",
                        sm: "fit-content",
                    },
                }}
                disabled={nextDisabled}
            >
                {activeStep === numberOfSteps ? "Place order" : "Next"}
            </Button>
        </Box>
    );
};
export default CheckoutNavButtons;
