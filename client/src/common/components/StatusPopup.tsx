import { Button, LinearProgress } from "@mui/material";
import React from "react";

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
        <div
            className="status-popup-container"
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100dvh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 30,
            }}
        >
            <div
                className="status-popup"
                style={{
                    width: "350px",
                    height: "200px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "5px solid #ec7f52",
                    backgroundColor: "var(--peach-blossom)",
                    borderRadius: "10px",
                }}
            >
                <span className="status-msg" style={{ marginBottom: "30px" }}>
                    {statusMessage}
                </span>
                <div className="status-popup-active-component">
                    {activeComponent}
                </div>
            </div>
        </div>
    );
};
export default StatusPopup;
