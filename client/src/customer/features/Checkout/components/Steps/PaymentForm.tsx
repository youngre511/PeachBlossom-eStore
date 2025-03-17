import * as React from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import FormLabel from "@mui/material/FormLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CreditCardRounded from "@mui/icons-material/CreditCardRounded";
import AccountBalanceRounded from "@mui/icons-material/AccountBalanceRounded";
import SimCardRoundedIcon from "@mui/icons-material/SimCardRounded";

import { styled } from "@mui/system";
import { PaymentDetails } from "../../checkoutTypes";
import useExpirationFormatter from "../../hooks/useExpirationFormatter";
import usePaymentFormValidation from "../../hooks/usePaymentFormValidation";

const FormGrid = styled("div")(() => ({
    display: "flex",
    flexDirection: "column",
}));

interface PaymentFormProps {
    setPaymentFormValid: React.Dispatch<React.SetStateAction<boolean>>;
    setPaymentDetails: React.Dispatch<React.SetStateAction<PaymentDetails>>;
    paymentDetails: PaymentDetails;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
    setPaymentFormValid,
    setPaymentDetails,
    paymentDetails,
}) => {
    const [paymentType, setPaymentType] = React.useState("creditCard");
    const [expirationDate, setExpirationDate] = React.useState<string>("");
    const [expirationInvalid, setExpirationInvalid] =
        React.useState<boolean>(false);
    const [expirationError, setExpirationError] =
        React.useState<boolean>(false);
    const [name, setName] = React.useState("");

    usePaymentFormValidation({ setPaymentFormValid, expirationInvalid, name });

    const handleExpirationDateChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        let input = event.target;
        const { formattedValue } = useExpirationFormatter({
            input,
            setExpirationInvalid,
        });
        setExpirationDate(formattedValue);
        setPaymentDetails({
            ...paymentDetails,
            expiryDate: formattedValue,
        });
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setName(event.target.value);
        setPaymentDetails({
            ...paymentDetails,
            cardHolder: event.target.value,
        });
    };

    return (
        <Stack spacing={{ xs: 3, sm: 6 }} useFlexGap>
            <Box
                sx={{
                    display: "flex",
                    width: "100%",
                    flexDirection: { sm: "column", md: "row" },
                    gap: 2,
                }}
            >
                <Card
                    raised={paymentType === "creditCard"}
                    sx={{
                        maxWidth: { sm: "100%", md: "50%" },
                        flexGrow: 1,
                        outline: "1px solid",
                        outlineColor:
                            paymentType === "creditCard"
                                ? "primary.main"
                                : "divider",
                        backgroundColor:
                            paymentType === "creditCard"
                                ? "background.default"
                                : "",
                    }}
                >
                    <CardActionArea
                        onClick={() => setPaymentType("creditCard")}
                    >
                        <CardContent
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <CreditCardRounded
                                color="primary"
                                fontSize="small"
                            />
                            <Typography fontWeight="medium">Card</Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
                <Card
                    raised={paymentType === "bankTransfer"}
                    sx={{
                        maxWidth: { sm: "100%", md: "50%" },
                        flexGrow: 1,
                        outline: "1px solid",
                        outlineColor:
                            paymentType === "bankTransfer"
                                ? "primary.main"
                                : "divider",
                        backgroundColor:
                            paymentType === "bankTransfer"
                                ? "background.default"
                                : "#00000011",
                    }}
                >
                    <CardActionArea
                        sx={{
                            ".MuiCardActionArea-focusHighlight": {
                                backgroundColor: "transparent",
                            },
                            "&:focus-visible": {
                                backgroundColor: "action.hover",
                            },
                        }}
                    >
                        <CardContent
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                            }}
                        >
                            <AccountBalanceRounded
                                fontSize="small"
                                sx={{ color: "#00000088" }}
                            />
                            <Typography
                                sx={{
                                    fontWeight: "medium",
                                    color: "#00000088",
                                }}
                            >
                                Bank account
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Box>

            {paymentType === "creditCard" && (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 2,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            p: 3,
                            height: { xs: 300, sm: 350, md: 375 },
                            width: "100%",
                            borderRadius: "20px",
                            border: "1px solid ",
                            borderColor: "divider",
                            backgroundColor: "background.paper",
                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.05)",
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography variant="subtitle2">
                                Credit card
                            </Typography>
                            <CreditCardRounded
                                sx={{ color: "text.secondary" }}
                            />
                        </Box>
                        <SimCardRoundedIcon
                            sx={{
                                fontSize: { xs: 48, sm: 56 },
                                transform: "rotate(90deg)",
                                color: "text.secondary",
                            }}
                        />
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                width: "100%",
                                gap: 2,
                            }}
                        >
                            <FormGrid sx={{ flexGrow: 1 }}>
                                <FormLabel htmlFor="card-number" required>
                                    Card number
                                </FormLabel>
                                <OutlinedInput
                                    id="card-number"
                                    autoComplete="card-number"
                                    placeholder="1234 5678 9012 3456"
                                    required
                                    value={"1234 5678 9012 3456"}
                                    // onChange={handleCardNumberChange}
                                />
                            </FormGrid>
                            <FormGrid sx={{ maxWidth: "20%" }}>
                                <FormLabel htmlFor="cvv" required>
                                    CVV
                                </FormLabel>
                                <OutlinedInput
                                    id="cvv"
                                    autoComplete="CVV"
                                    placeholder="123"
                                    required
                                    value={123}
                                    // onChange={handleCvvChange}
                                />
                            </FormGrid>
                        </Box>
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <FormGrid sx={{ flexGrow: 1 }}>
                                <FormLabel htmlFor="card-name" required>
                                    Name
                                </FormLabel>
                                <OutlinedInput
                                    id="card-name"
                                    autoComplete="cc-name"
                                    placeholder="John Smith"
                                    type="text"
                                    value={name}
                                    required
                                    onChange={handleNameChange}
                                />
                            </FormGrid>
                            <FormGrid sx={{ flexGrow: 1 }}>
                                <FormLabel htmlFor="card-expiration" required>
                                    Expiration date
                                </FormLabel>
                                <OutlinedInput
                                    id="card-expiration"
                                    inputProps={{
                                        inputMode: "numeric",
                                    }}
                                    autoComplete="cc-exp"
                                    placeholder="MM/YY"
                                    required
                                    value={expirationDate}
                                    onChange={handleExpirationDateChange}
                                    onBlur={() =>
                                        setExpirationError(expirationInvalid)
                                    }
                                    error={expirationError}
                                />
                            </FormGrid>
                        </Box>
                    </Box>
                </Box>
            )}
        </Stack>
    );
};

export default PaymentForm;
