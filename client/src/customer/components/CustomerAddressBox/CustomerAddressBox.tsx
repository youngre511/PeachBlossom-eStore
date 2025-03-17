import React from "react";
import { FormControlLabel, Radio } from "@mui/material";
import PhoneEnabledSharpIcon from "@mui/icons-material/PhoneEnabledSharp";
import "./customer-address-box.css";
import GoldButton from "../../../common/components/GoldButton";
import { CustomerAddress } from "../../store/userData/UserDataTypes";

interface CustomerAddressBoxProps {
    address: CustomerAddress;
    hideButtons?: boolean;
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
    hideButtons,
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
                    value={address.address_id}
                    label={addressDisplay}
                />
            )}
            {!isCheckout && (
                <React.Fragment>
                    {addressDisplay}
                    {!hideButtons && handleEdit && handleRemove && (
                        <div className="ca-buttons">
                            <GoldButton
                                text="edit"
                                height="30px"
                                onClick={() => handleEdit(address.address_id)}
                            />
                            <GoldButton
                                text="remove"
                                height="30px"
                                onClick={() => handleRemove(address.address_id)}
                            />
                            {/* <GoldButton text="make default" onClick={() => handleMakeDefault(address.addressId)} /> */}
                        </div>
                    )}
                </React.Fragment>
            )}
        </div>
    );
};
export default CustomerAddressBox;
