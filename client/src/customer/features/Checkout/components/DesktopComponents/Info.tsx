import * as React from "react";

import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import { CartItem } from "../../../Cart/CartTypes";

interface InfoProps {
    totalPrice: number;
    items: CartItem[];
}

export default function Info({ totalPrice, items }: InfoProps) {
    return (
        <React.Fragment>
            <Typography variant="subtitle2" color="text.secondary">
                Total
            </Typography>
            <Typography variant="h4" gutterBottom>
                {`$${Number(totalPrice).toFixed(2)}`}
            </Typography>
            <List disablePadding>
                {items.map((item) => (
                    <ListItem key={item.productNo} sx={{ py: 1, px: 0 }}>
                        <ListItemText
                            sx={{ mr: 2 }}
                            primary={item.name}
                            secondary={`Qty ${item.quantity}`}
                        />
                        {item.discountPrice && (
                            <React.Fragment>
                                <Typography
                                    variant="body1"
                                    fontWeight="medium"
                                    sx={{
                                        color: "#EC7F52",
                                        fontWeight: 700,
                                    }}
                                >
                                    {`$${item.price}`}
                                </Typography>
                                <Typography
                                    variant="body1"
                                    fontWeight="medium"
                                    sx={{
                                        textDecoration: "line-through",
                                        marginLeft: "5px",
                                    }}
                                >
                                    {`$${item.price}`}
                                </Typography>
                            </React.Fragment>
                        )}
                        {!item.discountPrice && (
                            <Typography variant="body1" fontWeight="medium">
                                {`$${item.price}`}
                            </Typography>
                        )}
                    </ListItem>
                ))}
            </List>
        </React.Fragment>
    );
}
