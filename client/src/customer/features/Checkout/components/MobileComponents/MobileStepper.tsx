import { Step, StepLabel, Stepper } from "@mui/material";
import React from "react";

interface MobileStepperProps {
    activeStep: number;
    steps: string[];
}
const MobileStepper: React.FC<MobileStepperProps> = ({ activeStep, steps }) => {
    return (
        <Stepper
            id="mobile-stepper"
            activeStep={activeStep}
            alternativeLabel
            sx={{ display: { sm: "flex", md: "none" } }}
        >
            {steps.map((label) => (
                <Step
                    sx={{
                        ":first-of-type": { pl: 0 },
                        ":last-of-type": { pr: 0 },
                        "& .MuiStepConnector-root": {
                            top: { xs: 6, sm: 12 },
                        },
                    }}
                    key={label}
                >
                    <StepLabel
                        sx={{
                            ".MuiStepLabel-labelContainer": {
                                maxWidth: "70px",
                            },
                        }}
                    >
                        {label}
                    </StepLabel>
                </Step>
            ))}
        </Stepper>
    );
};
export default MobileStepper;
