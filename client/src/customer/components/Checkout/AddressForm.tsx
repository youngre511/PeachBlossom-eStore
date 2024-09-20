import React, { useState } from "react";

import FormLabel from "@mui/material/FormLabel";
import Grid from "@mui/material/Grid";
import OutlinedInput from "@mui/material/OutlinedInput";
import { styled } from "@mui/system";
import { MuiTelInput } from "mui-tel-input";
import { ShippingDetails } from "./Checkout";
import { TextField } from "@mui/material";

const FormGrid = styled(Grid)(() => ({
    display: "flex",
    flexDirection: "column",
}));

interface AddressFormProps {
    setShippingDetails: React.Dispatch<React.SetStateAction<ShippingDetails>>;
    shippingDetails: ShippingDetails;
    validStates: string[];
}

const AddressForm: React.FC<AddressFormProps> = ({
    setShippingDetails,
    shippingDetails,
    validStates,
}) => {
    const [invalidStateAbbr, setInvalidStateAbbr] = useState<boolean>(false);
    const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const param = event.target.name as string;
        let value = "";
        if (event.target.value) {
            if (param === "state") {
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

    return (
        <Grid container spacing={3}>
            <FormGrid item xs={12} md={6}>
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
            <FormGrid item xs={12} md={6}>
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
            <FormGrid item xs={12}>
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
            <FormGrid item xs={12}>
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
            <FormGrid item xs={6}>
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
            <FormGrid item xs={6}>
                <FormLabel htmlFor="state" required error={invalidStateAbbr}>
                    State
                </FormLabel>
                <TextField
                    id="state"
                    name="state"
                    type="state"
                    placeholder="NY"
                    error={invalidStateAbbr}
                    inputProps={{ maxLength: 10 }}
                    value={shippingDetails.state}
                    onChange={handleFieldChange}
                    onBlur={handleStateAbbrBlur}
                    autoComplete="State"
                    required
                />
            </FormGrid>
            <FormGrid item xs={6}>
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
            <FormGrid item xs={6}>
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
                    label="Use this address for payment details"
                />
            </FormGrid> */}
        </Grid>
    );
};

export default AddressForm;
