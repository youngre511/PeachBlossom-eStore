import React, { useState } from "react";

import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid2";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/system";
import { MuiTelInput } from "mui-tel-input";

import { TextField } from "@mui/material";
import { ShippingDetails } from "../Checkout/Checkout";

interface AddressFormProps {
    setShippingDetails: React.Dispatch<React.SetStateAction<ShippingDetails>>;
    shippingDetails: ShippingDetails;
    nickname?: string;
    setNickname?: React.Dispatch<React.SetStateAction<string>>;
    sidebar?: boolean;
}

const FormGrid = styled(Grid)(() => ({
    display: "flex",
    flexDirection: "column",
}));

export const validStates = [
    "AK",
    "AL",
    "AR",
    "AZ",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "IA",
    "ID",
    "IL",
    "IN",
    "KS",
    "KY",
    "LA",
    "MA",
    "MD",
    "ME",
    "MI",
    "MN",
    "MO",
    "MS",
    "MT",
    "NC",
    "ND",
    "NE",
    "NH",
    "NJ",
    "NM",
    "NV",
    "NY",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VA",
    "VT",
    "WA",
    "WI",
    "WV",
    "WY",
];

const AddressForm: React.FC<AddressFormProps> = ({
    setShippingDetails,
    shippingDetails,
    nickname,
    setNickname,
    sidebar = false,
}) => {
    const [invalidStateAbbr, setInvalidStateAbbr] = useState<boolean>(false);
    const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const param = event.target.name as string;
        let value = "";
        if (event.target.value) {
            if (param === "stateAbbr") {
                value = event.target.value.toUpperCase().substring(0, 2);
                if (value.length > 1 && !validStates.includes(value)) {
                    setInvalidStateAbbr(true);
                } else {
                    setInvalidStateAbbr(false);
                }
            } else {
                value = event.target.value;
            }
        }
        setShippingDetails({ ...shippingDetails, [param]: value });
    };

    const handleTelInputChange = (value: string, info: any) => {
        setShippingDetails((prevDetails) => ({
            ...prevDetails,
            phoneNumber: value,
        }));
    };

    const handleStateAbbrBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        if (
            event.target.value.length > 0 &&
            !validStates.includes(event.target.value)
        ) {
            setInvalidStateAbbr(true);
        }
    };

    const handleNicknameChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (setNickname) setNickname(event.target.value);
    };

    return (
        <form>
            <FormGrid container spacing={3}>
                {sidebar && (
                    <FormGrid
                        size={{
                            xs: 12,
                            md: sidebar ? undefined : 6,
                        }}
                    >
                        <FormLabel htmlFor="first-name">
                            Address Nickname
                        </FormLabel>
                        <OutlinedInput
                            id="nickname"
                            name="nickname"
                            type="name"
                            placeholder="Home, Work, Brother, etc."
                            value={nickname}
                            autoComplete="off"
                            onChange={handleNicknameChange}
                        />
                    </FormGrid>
                )}
                <FormGrid
                    size={{
                        xs: 12,
                        md: sidebar ? undefined : 6,
                    }}
                >
                    <FormLabel htmlFor="first-name" required>
                        First name
                    </FormLabel>
                    <OutlinedInput
                        id="first-name"
                        name="firstName"
                        type="name"
                        placeholder="John"
                        value={shippingDetails.firstName}
                        autoComplete="first name"
                        onChange={handleFieldChange}
                        required
                    />
                </FormGrid>
                <FormGrid
                    size={{
                        xs: 12,
                        md: sidebar ? undefined : 6,
                    }}
                >
                    <FormLabel htmlFor="last-name" required>
                        Last name
                    </FormLabel>
                    <OutlinedInput
                        id="last-name"
                        name="lastName"
                        type="last-name"
                        value={shippingDetails.lastName}
                        onChange={handleFieldChange}
                        placeholder="Snow"
                        autoComplete="last name"
                        required
                    />
                </FormGrid>
                <FormGrid size={12}>
                    <FormLabel htmlFor="address1" required>
                        Address line 1
                    </FormLabel>
                    <OutlinedInput
                        id="address1"
                        name="shippingAddress"
                        type="address1"
                        value={shippingDetails.shippingAddress}
                        onChange={handleFieldChange}
                        placeholder="Street name and number"
                        autoComplete="shipping address-line1"
                        required
                    />
                </FormGrid>
                <FormGrid size={12}>
                    <FormLabel htmlFor="address2">Address line 2</FormLabel>
                    <OutlinedInput
                        id="address2"
                        name="shippingAddress2"
                        type="address2"
                        value={shippingDetails.shippingAddress2}
                        onChange={handleFieldChange}
                        placeholder="Apartment, suite, unit, etc. (optional)"
                        autoComplete="shipping address-line2"
                        required
                    />
                </FormGrid>
                <FormGrid size={sidebar ? 12 : 6}>
                    <FormLabel htmlFor="city" required>
                        City
                    </FormLabel>
                    <OutlinedInput
                        id="city"
                        name="city"
                        type="city"
                        value={shippingDetails.city}
                        onChange={handleFieldChange}
                        placeholder="New York"
                        autoComplete="City"
                        required
                    />
                </FormGrid>
                <FormGrid size={6}>
                    <FormLabel
                        htmlFor="state"
                        required
                        error={invalidStateAbbr}
                    >
                        State
                    </FormLabel>
                    <TextField
                        id="stateAbbr"
                        name="stateAbbr"
                        type="state"
                        placeholder="NY"
                        error={invalidStateAbbr}
                        slotProps={{ htmlInput: { maxLength: 10 } }}
                        value={shippingDetails.stateAbbr}
                        onChange={handleFieldChange}
                        onBlur={handleStateAbbrBlur}
                        autoComplete="State"
                        required
                    />
                </FormGrid>
                <FormGrid size={6}>
                    <FormLabel htmlFor="zip" required>
                        Zip / Postal code
                    </FormLabel>
                    <OutlinedInput
                        id="zip"
                        name="zipCode"
                        type="zip"
                        placeholder="12345"
                        value={shippingDetails.zipCode}
                        onChange={handleFieldChange}
                        autoComplete="shipping postal-code"
                        required
                    />
                </FormGrid>
                <FormGrid size={sidebar ? 12 : 6}>
                    <FormLabel htmlFor="phone" required>
                        Phone Number
                    </FormLabel>
                    <MuiTelInput
                        id="phone"
                        name="phoneNumber"
                        autoComplete="tel"
                        value={shippingDetails.phoneNumber}
                        onChange={handleTelInputChange}
                        required
                        defaultCountry="US"
                        forceCallingCode
                    />
                </FormGrid>
                {/* <FormGrid item xs={12}>
                    <FormControlLabel
                        control={<Checkbox name="saveAddress" value="yes" />}
                        label="Save address for future use"
                    />
                </FormGrid> */}
            </FormGrid>
        </form>
    );
};

export default AddressForm;
