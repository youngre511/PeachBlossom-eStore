import React from "react";
import { useEffect } from "react";
import { Stepper, Step, StepLabel, StepContent, Box } from "@mui/material";

interface Props {
    orderStatus:
        | "in process"
        | "ready to ship"
        | "delivered"
        | "shipped"
        | "delivered";
}
export const StatusStepper: React.FC<Props> = ({ orderStatus }) => {
    let activeStep: number;

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

    const steps = [
        {
            label: "In Process",
            description:
                "We've received your order, and we're working hard to get it to you as soon as possible. Our team members are gathering the products you ordered to prepare them for shipping.",
        },
        {
            label: "Ready to Ship",
            description:
                "Your order is assembled and ready to send out. It'll be on it's way to you before you know it. You'll receive an email notifying you when your order has shipped.",
        },
        {
            label: "Shipped",
            description:
                "Your order is on its way! We can't wait for you to be able to enjoy our products.",
        },
        {
            label: "Delivered",
            description:
                "Your order has been delivered! We hope you love every product you got. If not, contact us as soon as possible so that we can get you a replacement or refund. Nothing but the best for our customers!",
        },
    ];

    return (
        <Box sx={{ maxWidth: 400 }}>
            <Stepper activeStep={activeStep} orientation="vertical">
                {steps.map((step, index) => (
                    <Step key={step.label}>
                        <StepLabel>{step.label}</StepLabel>
                        <StepContent>{step.description}</StepContent>
                    </Step>
                ))}
            </Stepper>
        </Box>
    );
};
export default StatusStepper;
