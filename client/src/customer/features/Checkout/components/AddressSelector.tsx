import React, { useState } from "react";
import { useEffect } from "react";
import {
    ShippingDetails,
    CustomerAddress,
} from "../../../store/userData/UserDataTypes";
import CustomerAddressBox from "../../../components/CustomerAddressBox/CustomerAddressBox";
import { FormControl, Icon, RadioGroup } from "@mui/material";
import AddCircleOutlineSharpIcon from "@mui/icons-material/AddCircleOutlineSharp";
import "./address-selector.css";

interface AddressSelectorProps {
    addressList: CustomerAddress[];
    setShippingDetails: React.Dispatch<React.SetStateAction<ShippingDetails>>;
    setAddNew: React.Dispatch<React.SetStateAction<boolean>>;
}
const AddressSelector: React.FC<AddressSelectorProps> = ({
    addressList,
    setShippingDetails,
    setAddNew,
}) => {
    const [selectedAddress, setSelectedAddress] = useState<number>(
        addressList[0].address_id
    );

    useEffect(() => {
        const address: any = {
            ...addressList.filter(
                (address) => address.address_id === selectedAddress
            )[0],
        };
        address.shippingAddress = address.shippingAddress1;
        delete address.shippingAddress1;
        delete address.nickname;
        delete address.address_id;
        if (!address.shippingAddress2) {
            address.shippingAddress2 = "";
        }
        setShippingDetails(address);
    }, [selectedAddress]);

    return (
        <div className="address-selector">
            <FormControl sx={{ width: "100%" }}>
                <RadioGroup
                    value={selectedAddress}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSelectedAddress(
                            Number((e.target as HTMLInputElement).value)
                        )
                    }
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                        columnGap: "20px",
                    }}
                >
                    {addressList.map((address) => (
                        <CustomerAddressBox
                            address={address}
                            isCheckout={true}
                            key={`address${address.address_id}`}
                        />
                    ))}
                    <div
                        className="new-address"
                        onClick={() => setAddNew(true)}
                    >
                        <AddCircleOutlineSharpIcon />
                        <h2>Add a new delivery address</h2>
                    </div>
                </RadioGroup>
            </FormControl>
        </div>
    );
};
export default AddressSelector;
