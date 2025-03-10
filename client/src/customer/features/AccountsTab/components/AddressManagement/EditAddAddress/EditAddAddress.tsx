import React, { SetStateAction, useState } from "react";
import { useEffect } from "react";
import { CustomerAddress } from "../../../../../store/userData/UserDataTypes";
import {
    useAppDispatch,
    useAppSelector,
} from "../../../../../hooks/reduxHooks";
import { RootState } from "../../../../../store/customerStore";
import { CircularProgress } from "@mui/material";
import { ShippingDetails } from "../../../../../store/userData/UserDataTypes";
import AddressForm from "../../../../../components/AddressForm/AddressForm";
import GoldButton from "../../../../../../common/components/GoldButton";
import {
    addAddress,
    editAddress,
} from "../../../../../store/userData/userDataSlice";
import "./edit-add-address.css";

interface EditAddAddressProps {
    type: "edit" | "add";
    setSubpanelVisible: React.Dispatch<SetStateAction<boolean>>;
    address?: CustomerAddress;
}
const EditAddAddress: React.FC<EditAddAddressProps> = ({
    type,
    setSubpanelVisible,
    address,
}) => {
    const userData = useAppSelector((state: RootState) => state.userData);
    let error = userData.error;
    const loading = userData.loading;
    const [saving, setSaving] = useState<boolean>(false);
    const [shippingDetails, setShippingDetails] = useState<ShippingDetails>({
        shippingAddress:
            address && address.shippingAddress1 ? address.shippingAddress1 : "",
        shippingAddress2:
            address && address.shippingAddress2 ? address.shippingAddress2 : "",
        firstName: address && address.firstName ? address.firstName : "",
        lastName: address && address.lastName ? address.lastName : "",
        zipCode: address && address.zipCode ? address.zipCode : "",
        phoneNumber: address && address.phoneNumber ? address.phoneNumber : "",
        stateAbbr: address && address.stateAbbr ? address.stateAbbr : "",
        city: address && address.city ? address.city : "",
    });

    const [nickname, setNickname] = useState<string>(
        address && address.nickname ? address.nickname : ""
    );
    const dispatch = useAppDispatch();

    const handleSave = () => {
        if (type === "add") {
            dispatch(addAddress({ address: shippingDetails, nickname }));
        } else if (address) {
            dispatch(
                editAddress({
                    addressId: address?.address_id,
                    address: shippingDetails,
                    nickname,
                })
            );
        }
    };

    useEffect(() => {
        if (loading) {
            setSaving(true);
        } else if (!loading && saving && !error) {
            setSubpanelVisible(false);
        }
    }, [loading, saving, setSaving]);

    return (
        <div className="edit-add-address">
            <h1 style={error ? { marginBottom: "15px" } : undefined}>
                {type === "add" ? "Add New " : "Edit "}Address
            </h1>
            {error && <div className="save-error">{error}</div>}
            <div
                className="edit-add-address-form"
                style={error ? { height: "calc(100vh - 179px" } : undefined}
            >
                <AddressForm
                    setShippingDetails={setShippingDetails}
                    shippingDetails={shippingDetails}
                    nickname={nickname}
                    setNickname={setNickname}
                    sidebar={true}
                />
                <div className="edit-add-btns">
                    <GoldButton text="save" onClick={handleSave} width="100%" />
                    <GoldButton
                        text="Cancel"
                        onClick={() => setSubpanelVisible(false)}
                        width="100%"
                    />
                </div>
            </div>
            {loading && (
                <div className="loading-overlay">
                    <CircularProgress />
                </div>
            )}
        </div>
    );
};
export default EditAddAddress;
