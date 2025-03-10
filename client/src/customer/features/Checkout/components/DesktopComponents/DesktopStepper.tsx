import { Box, Step, StepLabel, Stepper } from "@mui/material";
import React from "react";

interface DesktopStepperProps {
    activeStep: number;
    steps: string[];
}
const DesktopStepper: React.FC<DesktopStepperProps> = ({
    activeStep,
    steps,
}) => {
    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "flex-end",
                flexGrow: 1,
                height: 60,
            }}
        >
            <Stepper
                id="desktop-stepper"
                activeStep={activeStep}
                sx={{
                    width: "100%",
                    height: 40,
                }}
            >
                {steps.map((label) => (
                    <Step
                        sx={{
                            ":first-of-type": { pl: 0 },
                            ":last-of-type": { pr: 0 },
                        }}
                        key={label}
                    >
                        <StepLabel>{label}</StepLabel>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
};
export default DesktopStepper;
