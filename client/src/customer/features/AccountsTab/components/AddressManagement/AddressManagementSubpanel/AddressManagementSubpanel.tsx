import { ChevronLeftSharp } from "@mui/icons-material";
import React, { SetStateAction, useState } from "react";
import { useEffect } from "react";
import "./address-management-subpanel.css";
import { CustomerAddress } from "../../../../../store/userData/UserDataTypes";
import EditAddAddress from "../EditAddAddress/EditAddAddress";
import RemoveAddress from "../RemoveAddress/RemoveAddress";

interface AddressManagementSubpanelProps {
    setShowSubpanel: React.Dispatch<SetStateAction<boolean>>;
    type: "add" | "edit" | "remove";
    address?: CustomerAddress;
    error: string | null;
}

const AddressManagementSubpanel: React.FC<AddressManagementSubpanelProps> = ({
    setShowSubpanel,
    type,
    address,
    error,
}) => {
    const [subpanelVisible, setSubpanelVisible] = useState<boolean>(false);
    const [fullyOpen, setFullyOpen] = useState<boolean>(false);

    useEffect(() => {
        // If both subpanelVisible and fullyOpen are true, a condition that only occurs after the panel is mounted and fully open,
        // then toggling subpanelVisible to false initiates closing animation and then unmounts component (through setShowSubpanel(false))
        if (!subpanelVisible && fullyOpen) {
            setTimeout(() => {
                setShowSubpanel(false);
            }, 300);
            //On component mount, initiate the opening animation by setting subpanelVisible to true and then set Fully open to true when the animation is complete.
        } else if (!subpanelVisible) {
            setSubpanelVisible(true);
            setTimeout(() => {
                setFullyOpen(true);
            }, 300);
        }
    }, [subpanelVisible]);

    return (
        <div
            className="address-subpanel"
            style={subpanelVisible ? { transform: "translateX(0)" } : undefined}
        >
            <div
                className="address-subpanel-back-btn"
                onClick={() => setSubpanelVisible(false)}
            >
                <ChevronLeftSharp />
                Back
            </div>
            {(type === "edit" || type === "add") && (
                <EditAddAddress
                    type={type}
                    setSubpanelVisible={setSubpanelVisible}
                    address={type === "edit" ? address : undefined}
                />
            )}
            {type === "remove" && address && (
                <RemoveAddress
                    address={address}
                    setSubpanelVisible={setSubpanelVisible}
                />
            )}
        </div>
    );
};
export default AddressManagementSubpanel;
