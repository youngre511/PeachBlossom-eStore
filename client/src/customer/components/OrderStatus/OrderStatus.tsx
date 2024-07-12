import { CircularProgress, FormControl, TextField } from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";
import PeachButton from "../../../common/components/PeachButton";
import axios, { AxiosError } from "axios";
import StatusStepper from "./StatusStepper";

interface Props {
    orderNumber?: string;
}
const OrderStatus: React.FC<Props> = ({ orderNumber }) => {
    const [orderNo, setOrderNo] = useState<string | null>(null);
    const [formData, setFormData] = useState<{
        orderNo: string;
        email: string;
    }>({ orderNo: "", email: "" });
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (orderNumber) {
            setOrderNo(orderNumber);
        }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}order/${formData.orderNo}`,
                {
                    params: { email: formData.email },
                }
            );
            console.log("Response:", response.data);
        } catch (error) {
            if (error instanceof AxiosError) {
                setError(error.message);
                console.error("Error fetching order:", error);
            } else {
                setError(
                    "Something went wrong while looking up your order. Please try again."
                );
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {!orderNo && (
                <div className="enter-order-number-dialog">
                    <div className="track-order-text">
                        <h1>Track Order</h1>
                        {!error && (
                            <p>
                                Track your order by entering your order number
                                and the email associated with the order below.
                            </p>
                        )}
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                    <form onSubmit={handleSubmit}>
                        <FormControl>
                            <div className="enter-orderNo">
                                <TextField
                                    required
                                    label="Order Number"
                                    name="orderNo"
                                    value={formData.orderNo}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="enter-email">
                                <TextField
                                    required
                                    label="Email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <PeachButton
                                text="VIEW ORDER"
                                type="submit"
                                onClick={() => {}}
                            />
                        </FormControl>
                    </form>
                    {loading && <CircularProgress />}
                    <StatusStepper orderStatus="in process" />
                </div>
            )}
        </div>
    );
};
export default OrderStatus;
