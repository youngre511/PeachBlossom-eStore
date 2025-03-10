import { CircularProgress, FormControl, TextField } from "@mui/material";
import React from "react";
import { useState } from "react";
import GoldButton from "../../../../common/components/GoldButton";

interface Props {
    onSubmit: (formData: { orderNo: string; email: string }) => void;
    error: string | null;
    loading: boolean;
}
const OrderLookup: React.FC<Props> = ({ onSubmit, error, loading }) => {
    const [formData, setFormData] = useState<{
        orderNo: string;
        email: string;
    }>({ orderNo: "", email: "" });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <React.Fragment>
            <div className="enter-order-number-dialog">
                <div className="track-order-text">
                    <h1>Track Order</h1>
                    {!error && (
                        <p>
                            Track your order by entering your order number and
                            the email associated with the order below.
                        </p>
                    )}
                    {error && <p style={{ color: "red" }}>{error}</p>}
                </div>
                <form onSubmit={handleSubmit}>
                    <FormControl className="enter-order-number-form">
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
                        <GoldButton
                            text="VIEW ORDER"
                            type="submit"
                            onClick={() => {}}
                        />
                    </FormControl>
                </form>
                {loading && <CircularProgress />}
            </div>
        </React.Fragment>
    );
};
export default OrderLookup;
