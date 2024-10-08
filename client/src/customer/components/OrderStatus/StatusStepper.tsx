import React, { useEffect, useState } from "react";
import {
    Stepper,
    Step,
    StepLabel,
    Box,
    StepContent,
    StepIconProps,
} from "@mui/material";
import { useWindowSizeContext } from "../../../common/contexts/windowSizeContext";
import CheckIcon from "@mui/icons-material/Check";
import StepperIcon from "@mui/icons-material/Circle";

interface Props {
    steps: Array<{ label: string; description: string }>;
    activeStep: number;
}
export const StatusStepper: React.FC<Props> = ({ steps, activeStep }) => {
    const { width } = useWindowSizeContext();
    const CustomStepIcon = (props: StepIconProps) => {
        const { active, completed, className } = props;

        return completed || active ? (
            <CheckIcon
                className={className}
                sx={{
                    color: "white",
                    backgroundColor: "var(--dark-peach)",
                    borderRadius: "100%",
                    padding: "2px",
                }}
            />
        ) : (
            <div
                style={{
                    color: "white",
                    backgroundColor: "var(--dark-peach)",
                    borderRadius: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "24px",
                    height: "24px",
                    fontSize: ".9rem",
                    fontWeight: 600,
                }}
            >
                {activeStep + 1}
            </div>
        );
    };

    return (
        <Box sx={{ maxWidth: 800 }}>
            <Stepper
                activeStep={activeStep}
                orientation={width && width >= 600 ? "horizontal" : "vertical"}
            >
                {steps.map((step, index) => (
                    <Step key={step.label}>
                        <StepLabel StepIconComponent={CustomStepIcon}>
                            {step.label}
                        </StepLabel>
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
