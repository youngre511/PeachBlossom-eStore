import React from "react";
import { Stepper, Step, StepLabel, Box, StepContent } from "@mui/material";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";

interface Props {
    orderStatus:
        | "in process"
        | "ready to ship"
        | "delivered"
        | "shipped"
        | "delivered";
    steps: Array<{ label: string; description: string }>;
}
export const StatusStepper: React.FC<Props> = ({ orderStatus, steps }) => {
    let activeStep: number;
    const { width } = useWindowSizeContext();

    switch (orderStatus) {
        case "in process":
            activeStep = 0;
            break;
        case "ready to ship":
            activeStep = 1;
            break;
        case "shipped":
            activeStep = 2;
            break;
        case "delivered":
            activeStep = 3;
            break;
        default:
            activeStep = 0;
    }

    return (
        <Box sx={{ maxWidth: 800 }}>
            <Stepper
                activeStep={activeStep}
                orientation={width && width >= 600 ? "horizontal" : "vertical"}
            >
                {steps.map((step, index) => (
                    <Step key={step.label}>
                        <StepLabel>{step.label}</StepLabel>
                        {width && width < 600 && (
                            <StepContent>{step.description}</StepContent>
                        )}
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
};
export default StatusStepper;
