import React from "react";
import InfoMobile from "./InfoMobile";
import { Card, CardContent, Typography } from "@mui/material";
import { CartItem } from "../../../Cart/CartTypes";

interface MobileTopBarProps {
    orderTotal: number;
    items: CartItem[];
}
const MobileTopBar: React.FC<MobileTopBarProps> = ({ orderTotal, items }) => {
    return (
        <Card
            sx={{
                display: { xs: "flex", md: "none" },
                width: "100%",
            }}
        >
            <CardContent
                sx={{
                    display: "flex",
                    width: "100%",
                    alignItems: "center",
                    justifyContent: "space-between",
                    ":last-child": { pb: 2 },
                }}
            >
                <div>
                    <Typography variant="subtitle2" gutterBottom>
                        Selected products
                    </Typography>
                    <Typography variant="body1">
                        {`$${Number(orderTotal).toFixed(2)}`}
                    </Typography>
                </div>
                <InfoMobile orderTotal={orderTotal} items={items} />
            </CardContent>
        </Card>
    );
};
export default MobileTopBar;
