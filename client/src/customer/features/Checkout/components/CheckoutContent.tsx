import React, { SetStateAction, useState } from "react";
import AddressForm from "../../../components/AddressForm/AddressForm";
import AddressSelector from "./Steps/AddressSelector";
import PaymentForm from "./Steps/PaymentForm";
import Review from "./Steps/Review";
import useCheckoutStepValidation from "../hooks/useCheckoutStepValidation";
import { CartState } from "../../Cart/CartTypes";
import { PaymentDetails } from "../checkoutTypes";
import { RootState } from "../../../store/customerStore";
import { ShippingDetails } from "../../../store/userData/UserDataTypes";
import { useAppSelector } from "../../../hooks/reduxHooks";

interface CheckoutContentProps {
    addNew: boolean;
    setAddNew: React.Dispatch<SetStateAction<boolean>>;
    cart: CartState;
    email: string;
    setEmail: React.Dispatch<SetStateAction<string>>;
    loggedIn: boolean | undefined;
    orderTotal: number;
    paymentDetails: PaymentDetails;
    setPaymentDetails: React.Dispatch<SetStateAction<PaymentDetails>>;
    setCanProceed: React.Dispatch<SetStateAction<boolean>>;
    shippingDetails: ShippingDetails;
    setShippingDetails: React.Dispatch<SetStateAction<ShippingDetails>>;
    shippingRate: number;
    step: number;
    taxRate: number;
}
const CheckoutContent: React.FC<CheckoutContentProps> = ({
    addNew,
    setAddNew,
    cart,
    email,
    setEmail,
    loggedIn,
    orderTotal,
    paymentDetails,
    setPaymentDetails,
    setCanProceed,
    shippingDetails,
    setShippingDetails,
    shippingRate,
    step,
    taxRate,
}) => {
    const userAddresses = useAppSelector(
        (state: RootState) => state.userData.data.addressList
    );
    const [allAddressFieldsValid, setAllAddressFieldsValid] =
        useState<boolean>(false);
    const [paymentFormValid, setPaymentFormValid] = useState<boolean>(false);

    useCheckoutStepValidation({
        activeStep: step,
        setCanProceed,
        allAddressFieldsValid,
        paymentFormValid,
        email,
    });
    switch (step) {
        case 0:
            return loggedIn && userAddresses.length > 0 && !addNew ? (
                <AddressSelector
                    addressList={userAddresses}
                    setShippingDetails={setShippingDetails}
                    setAddNew={setAddNew}
                />
            ) : (
                <AddressForm
                    setShippingDetails={setShippingDetails}
                    shippingDetails={shippingDetails}
                    loggedInCheckout={loggedIn && userAddresses.length > 0}
                    setAddNew={setAddNew}
                    setAllAddressFieldsValid={setAllAddressFieldsValid}
                />
            );
        case 1:
            return (
                <PaymentForm
                    setPaymentFormValid={setPaymentFormValid}
                    setPaymentDetails={setPaymentDetails}
                    paymentDetails={paymentDetails}
                />
            );
        case 2:
            return (
                <Review
                    cart={cart}
                    taxRate={taxRate}
                    shipping={shippingRate}
                    total={orderTotal}
                    paymentDetails={paymentDetails}
                    shippingDetails={shippingDetails}
                    email={email}
                    setEmail={setEmail}
                />
            );
        default:
            throw new Error("Unknown step");
    }
};
export default CheckoutContent;
