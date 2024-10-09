import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import React from "react";
import { useEffect, useState } from "react";

interface Props {
    item_id: string;
    status: string;
    quantity: number;
    priceWhenOrdered: number;
    handleChangeStatus: (
        newStatus: string,
        item_id: string,
        oldStatus: string
    ) => void;
}
const AVOrderItemStatus: React.FC<Props> = ({
    item_id,
    status,
    quantity,
    priceWhenOrdered,
    handleChangeStatus,
}) => {
    const [itemStatus, setItemStatus] = useState<string>(status);
    useEffect(() => {
        setItemStatus(status);
    }, [status]);

    useEffect(() => {
        if (itemStatus !== status) {
            handleChangeStatus(itemStatus, item_id, status);
        }
    }, [itemStatus]);
    return (
        <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id={`${item_id}-label`}>Fulfillment Status</InputLabel>
            <Select
                labelId={`${item_id}-label`}
                id={`${item_id}-select`}
                value={itemStatus}
                label="Fulfillment Status"
                onChange={(e) => setItemStatus(e.target.value)}
            >
                <MenuItem value={"unfulfilled"}>unfulfilled</MenuItem>
                {quantity > 1 && (
                    <MenuItem value={"partially fulfilled"}>
                        partially fulfilled
                    </MenuItem>
                )}
                <MenuItem value={"fulfilled"}>fulfilled</MenuItem>
                <MenuItem value={"back ordered"}>back ordered</MenuItem>
                <MenuItem value={"on hold"}>on hold</MenuItem>
                <MenuItem value={"exception"}>exception</MenuItem>
                <MenuItem value={"cancelled"}>cancelled</MenuItem>
            </Select>
        </FormControl>
    );
};
export default AVOrderItemStatus;
