import { Button, LinearProgress } from "@mui/material";
import React from "react";
import BlankPopup from "./BlankPopup";

interface Props {
    status: "loading" | "success" | "failure";
    loadingMessage: string;
    successMessage: string;
    failureMessage: string | null;
    actionFunction: () => void;
}
const StatusPopup: React.FC<Props> = ({
    status,
    loadingMessage,
    successMessage,
    failureMessage,
    actionFunction,
}) => {
    let statusMessage: string;
    let activeComponent;
    if (status === "loading") {
        statusMessage = loadingMessage;
        activeComponent = <LinearProgress sx={{ width: "200px" }} />;
    } else if (status === "success") {
        statusMessage = successMessage;
        activeComponent = (
            <Button
                onClick={actionFunction}
                variant="contained"
                sx={{ color: "peach.lightContrastText" }}
            >
                OK
            </Button>
        );
    } else {
        if (failureMessage) {
            statusMessage = failureMessage;
        } else {
            statusMessage =
                "Oops! Something an unknown error occurred. Please try again later.";
        }
        activeComponent = (
            <Button onClick={actionFunction} variant="contained">
                OK
            </Button>
        );
    }

    return (
        <BlankPopup className="status-popup">
            <span className="status-msg" style={{ marginBottom: "30px" }}>
                {statusMessage}
            </span>
            <div className="status-popup-active-component">
                {activeComponent}
            </div>
        </BlankPopup>
    );
};
export default StatusPopup;
