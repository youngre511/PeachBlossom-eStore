import React, { SetStateAction } from "react";
import BlankPopup from "../../../../../common/components/BlankPopup";
import { Button } from "@mui/material";
import { IAVOrderDetails } from "../../avOrdersTypes";

interface AVOrderConfirmProps {
    currentDetails: IAVOrderDetails | null;
    handleSave: () => void;
    setIsConfirming: React.Dispatch<SetStateAction<boolean>>;
    toggleEditMode: (state: "on" | "off") => void;
}
const AVOrderConfirm: React.FC<AVOrderConfirmProps> = ({
    currentDetails,
    handleSave,
    setIsConfirming,
    toggleEditMode,
}) => {
    return (
        <BlankPopup className="save-confirmation">
            <span style={{ marginBottom: "20px" }}>
                Save changes made to order
                {currentDetails ? " " + currentDetails.orderNo : ""}?
            </span>
            <div className="save-confirmation-buttons">
                <Button
                    variant="contained"
                    onClick={handleSave}
                    sx={{ color: "white" }}
                >
                    Yes, Save
                </Button>
                <Button
                    variant="contained"
                    onClick={() => {
                        setIsConfirming(false);
                        toggleEditMode("on");
                    }}
                    sx={{ marginLeft: "20px", color: "white" }}
                >
                    Wait!
                </Button>
            </div>
        </BlankPopup>
    );
};
export default AVOrderConfirm;
