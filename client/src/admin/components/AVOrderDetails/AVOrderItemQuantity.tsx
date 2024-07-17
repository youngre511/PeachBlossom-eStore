import { TextField } from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";

interface Props {
    quantity: string;
    item_id: string;
    handleChangeQuantity: (newQuantity: string, item_id: string) => void;
    disabled: boolean;
}
const AVOrderItemQuantity: React.FC<Props> = ({
    quantity,
    item_id,
    handleChangeQuantity,
    disabled,
}) => {
    const [itemQuantity, setItemQuantity] = useState<string>(quantity);

    useEffect(() => {
        handleChangeQuantity(itemQuantity, item_id);
    }, [itemQuantity]);

    const quantityChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const regex = /^[0-9]+$/;

        if (regex.test(e.target.value) || e.target.value === "") {
            setItemQuantity(e.target.value);
        }
    };

    const quantityBlur = (
        e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const regex = /^[0-9]+$/;
        if (!regex.test(e.target.value) || e.target.value === "") {
            setItemQuantity(quantity);
        }
    };

    return (
        <TextField
            type="number"
            size="small"
            value={itemQuantity}
            disabled={disabled}
            onChange={(e) => quantityChange(e)}
            onBlur={(e) => quantityBlur(e)}
            fullWidth
            inputProps={{
                inputMode: "numeric",
            }}
        />
    );
};
export default AVOrderItemQuantity;
