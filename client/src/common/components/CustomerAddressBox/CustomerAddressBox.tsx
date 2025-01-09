import React from "react";
import { useEffect } from "react";
import { CustomerAddress } from "../../../customer/features/UserData/UserDataTypes";
import { FormControlLabel, Radio } from "@mui/material";
import PhoneEnabledSharpIcon from "@mui/icons-material/PhoneEnabledSharp";
import PeachButton from "../PeachButton";
import "./customer-address-box.css";

interface CustomerAddressBoxProps {
    address: CustomerAddress;
    isCheckout: boolean;
    handleRemove?: (addressId: number) => void;
    handleEdit?: (addressId: number) => void;
    handleMakeDefault?: (addressId: number) => void;
}
const CustomerAddressBox: React.FC<CustomerAddressBoxProps> = ({
    address,
    isCheckout,
    handleRemove,
    handleEdit,
    handleMakeDefault,
}) => {
    const addressDisplay = (
        <div className="ca-details">
            <div className="nickname">
                {address.nickname ? address.nickname : ""}
            </div>
            <h2 className="ca-recipient">{`${address.firstName} ${address.lastName}`}</h2>
            <div className="ca-streetAdd1">{address.shippingAddress1}</div>
            {address.shippingAddress2 && (
                <div className="ca-streetAdd2">{address.shippingAddress2}</div>
            )}
            <div className="ca-csz">
                <span className="ca-city">{address.city}</span>,{" "}
                <span className="ca-state">{address.stateAbbr}</span>{" "}
                <span className="ca-zip">{address.zipCode}</span>
            </div>
            <div className="ca-phone">
                <PhoneEnabledSharpIcon fontSize="small" /> {address.phoneNumber}
            </div>
        </div>
    );

    return (
        <div className="customer-address">
            {isCheckout && (
                <FormControlLabel
                    control={<Radio />}
                    value={address.addressId}
                    label={addressDisplay}
                />
            )}
            {!isCheckout && handleEdit && handleRemove && (
                <React.Fragment>
                    {addressDisplay}
                    <div className="ca-buttons">
                        <PeachButton
                            text="edit"
                            height="30px"
                            onClick={() => handleEdit(address.addressId)}
                        />
                        <PeachButton
                            text="remove"
                            height="30px"
                            onClick={() => handleRemove(address.addressId)}
                        />
                        {/* <PeachButton text="make default" onClick={() => handleMakeDefault(address.addressId)} /> */}
                    </div>
                </React.Fragment>
            )}
        </div>
    );
};
export default CustomerAddressBox;
