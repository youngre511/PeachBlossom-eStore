import { ChevronLeftSharp } from "@mui/icons-material";
import React, { SetStateAction, useState } from "react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../hooks/reduxHooks";
import { RootState } from "../../../store/customerStore";
import { getCustomerAddresses } from "../../../features/UserData/userDataSlice";
import CustomerAddressBox from "../../../../common/components/CustomerAddressBox/CustomerAddressBox";
import { CircularProgress } from "@mui/material";
import "./address-management.css";
import PeachButton from "../../../../common/components/PeachButton";
import { useWindowSizeContext } from "../../../../common/contexts/windowSizeContext";

interface AddressManagementProps {
    setShowAddresses: React.Dispatch<SetStateAction<boolean>>;
}

const AddressManagement: React.FC<AddressManagementProps> = ({
    setShowAddresses,
}) => {
    const [addressesVisible, setAddressesVisible] = useState<boolean>(false);
    const [fullyOpen, setFullyOpen] = useState<boolean>(false);
    const userData = useAppSelector((state: RootState) => state.userData);
    const addressList = userData.data.addressList;
    const loading = userData.loading;
    const error = userData.error;
    const dispatch = useAppDispatch();
    const { width } = useWindowSizeContext();

    useEffect(() => {
        if (!addressesVisible && fullyOpen) {
            setTimeout(() => {
                setShowAddresses(false);
            }, 300);
        } else if (!addressesVisible) {
            setAddressesVisible(true);
            setTimeout(() => {
                setFullyOpen(true);
            }, 300);
        }
    }, [addressesVisible]);

    useEffect(() => {
        dispatch(getCustomerAddresses({ force: true }));
    }, []);

    useEffect(() => {
        console.log("component list:", addressList);
    }, [addressList]);

    const handleRemove = () => {};

    const handleEdit = () => {};

    const handleAdd = () => {};

    return (
        <div
            className="customer-addresses"
            style={
                addressesVisible ? { transform: "translateX(0)" } : undefined
            }
        >
            <div
                className="address-back-btn"
                onClick={() => setAddressesVisible(false)}
            >
                <ChevronLeftSharp />
                Back
            </div>
            <div className="address-list-cont">
                <div className="ca-header">
                    <h1>Your Addresses</h1>
                    <div className="ca-add-btn">
                        <PeachButton
                            text={width && width > 1100 ? "Add Address" : "+"}
                            onClick={handleAdd}
                            width={width && width > 1100 ? undefined : "30px"}
                            height="30px"
                        />
                    </div>
                </div>
                {
                    <div className="address-list">
                        {loading && <CircularProgress />}
                        {!loading && addressList.length === 0 && (
                            <div>You have no saved addresses.</div>
                        )}
                        {!loading &&
                            addressList.length > 0 &&
                            addressList.map((address) => (
                                <CustomerAddressBox
                                    address={address}
                                    key={address.addressId}
                                    isCheckout={false}
                                    handleRemove={handleRemove}
                                    handleEdit={handleEdit}
                                />
                            ))}
                    </div>
                }
            </div>
        </div>
    );
};
export default AddressManagement;
