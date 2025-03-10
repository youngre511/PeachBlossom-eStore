import React, { SetStateAction } from "react";
import { CustomerAddress } from "../../../../../store/userData/UserDataTypes";
import CustomerAddressBox from "../../../../../components/CustomerAddressBox/CustomerAddressBox";
import GoldButton from "../../../../../../common/components/GoldButton";
import "./remove-address.css";
import { useAppDispatch } from "../../../../../hooks/reduxHooks";
import { removeAddress } from "../../../../../store/userData/userDataSlice";

interface RemoveAddressProps {
    address: CustomerAddress;
    setSubpanelVisible: React.Dispatch<SetStateAction<boolean>>;
}
const RemoveAddress: React.FC<RemoveAddressProps> = ({
    address,
    setSubpanelVisible,
}) => {
    const dispatch = useAppDispatch();
    const handleRemove = () => {
        dispatch(removeAddress({ addressId: address.address_id }));
        setSubpanelVisible(false);
    };
    console.log(address);
    return (
        <div className="remove-dialog">
            <h1>Remove address?</h1>
            <CustomerAddressBox
                address={address}
                isCheckout={false}
                hideButtons={true}
            />
            <div className="remove-btns">
                <GoldButton text="yes" onClick={handleRemove} width="100%" />
                <GoldButton
                    text="Cancel"
                    onClick={() => setSubpanelVisible(false)}
                    width="100%"
                ></GoldButton>
            </div>
        </div>
    );
};
export default RemoveAddress;
