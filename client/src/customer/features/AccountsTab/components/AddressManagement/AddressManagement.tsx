import { ChevronLeftSharp } from "@mui/icons-material";
import React, { SetStateAction, useState } from "react";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../../hooks/reduxHooks";
import { RootState } from "../../../../store/customerStore";
import { getCustomerAddresses } from "../../../../store/userData/userDataSlice";
import CustomerAddressBox from "../../../../components/CustomerAddressBox/CustomerAddressBox";
import { CircularProgress } from "@mui/material";
import "./address-management.css";
import PeachButton from "../../../../../common/components/PeachButton";
import { useWindowSizeContext } from "../../../../../common/contexts/windowSizeContext";
import AddressManagementSubpanel from "./AddressManagementSubpanel/AddressManagementSubpanel";
import { CustomerAddress } from "../../../../store/userData/UserDataTypes";

interface AddressManagementProps {
    setShowAddresses: React.Dispatch<SetStateAction<boolean>>;
}

const AddressManagement: React.FC<AddressManagementProps> = ({
    setShowAddresses,
}) => {
    const [addressesVisible, setAddressesVisible] = useState<boolean>(false);
    const [fullyOpen, setFullyOpen] = useState<boolean>(false);
    const [showSubpanel, setShowSubpanel] = useState<boolean>(false);
    const [subpanelType, setSubpanelType] = useState<
        "add" | "edit" | "remove" | null
    >(null);
    const [subpanelAddress, setSubpanelAddress] =
        useState<CustomerAddress | null>(null);
    const userData = useAppSelector((state: RootState) => state.userData);
    const addressList = userData.data.addressList;
    const loading = userData.loading;
    const error = userData.error;
    const dispatch = useAppDispatch();
    const { width } = useWindowSizeContext();

    useEffect(() => {
        // If both addressesVisible and fullyOpen are true, a condition that only occurs after the panel is mounted and fully open,
        // then toggling addressesVisible to false initiates closing animation and then unmounts component (through setShowAddress(false))
        if (!addressesVisible && fullyOpen) {
            setTimeout(() => {
                setShowAddresses(false);
            }, 300);
            //On component mount, initiate the opening animation by setting addressesVisible to true and then set Fully open to true when the animation is complete.
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

    const handleRemove = (addressId: number) => {
        const addressToRemove = addressList.filter(
            (address) => address.address_id === addressId
        )[0];
        if (addressToRemove) {
            setSubpanelAddress(addressToRemove);
            setSubpanelType("remove");
            setShowSubpanel(true);
        }
    };

    const handleEdit = (addressId: number) => {
        const addressToEdit = addressList.filter(
            (address) => address.address_id === addressId
        )[0];
        if (addressToEdit) {
            setSubpanelAddress(addressToEdit);
            setSubpanelType("edit");
            setShowSubpanel(true);
        }
    };

    const handleAdd = () => {
        setSubpanelType("add");
        setShowSubpanel(true);
    };

    useEffect(() => {
        if (!showSubpanel) {
            setSubpanelType(null);
            setSubpanelAddress(null);
        }
    }, [showSubpanel]);

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
                                    key={address.address_id}
                                    isCheckout={false}
                                    handleRemove={handleRemove}
                                    handleEdit={handleEdit}
                                />
                            ))}
                    </div>
                }
            </div>
            {showSubpanel && subpanelType && (
                <AddressManagementSubpanel
                    setShowSubpanel={setShowSubpanel}
                    type={subpanelType}
                    error={error}
                    address={
                        subpanelType !== "add" && subpanelAddress
                            ? subpanelAddress
                            : undefined
                    }
                />
            )}
        </div>
    );
};
export default AddressManagement;
