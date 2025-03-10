import { useState, useEffect, useCallback, SetStateAction } from "react";
import { ShippingDetails } from "../../store/userData/UserDataTypes";

interface AddressFormValidationProps {
    setAllAddressFieldsValid: React.Dispatch<SetStateAction<boolean>>;
    invalidStateAbbr: boolean;
    invalidZipCode: boolean;
    invalidPhoneNumber: boolean;
    shippingDetails: ShippingDetails;
}

function useAddressFormValidation({
    setAllAddressFieldsValid,
    invalidStateAbbr,
    invalidZipCode,
    invalidPhoneNumber,
    shippingDetails,
}: AddressFormValidationProps) {
    useEffect(() => {
        const { shippingAddress, city, firstName, lastName } = shippingDetails;
        if (
            !invalidStateAbbr &&
            !invalidZipCode &&
            !invalidPhoneNumber &&
            shippingAddress &&
            city &&
            firstName &&
            lastName
        ) {
            setAllAddressFieldsValid(true);
        } else {
            setAllAddressFieldsValid(false);
        }
    }, [invalidStateAbbr, invalidZipCode, invalidPhoneNumber, shippingDetails]);
}

export default useAddressFormValidation;
