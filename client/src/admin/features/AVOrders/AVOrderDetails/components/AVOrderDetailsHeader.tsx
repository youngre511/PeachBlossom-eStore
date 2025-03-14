import React, { SetStateAction, useContext, useState } from "react";
import { useEffect } from "react";
import { SelectFieldNonFormik } from "../../../../../common/components/Fields/SelectFieldNonFormik";
import {
    IAVOrderDetails,
    OrderStatus,
    orderStatusOptions,
} from "../../avOrdersTypes";
import { Button, Grid2 as Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../../../common/contexts/authContext";
import { useNavigationContext } from "../../../../../common/contexts/navContext";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import updateLocale from "dayjs/plugin/updateLocale";
import {
    adminFormInputStyle,
    adminReadOnlyStyle,
} from "../../../../constants/formInputStyles";

dayjs.extend(customParseFormat);
dayjs.extend(updateLocale);
dayjs.updateLocale("en", {
    months: [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ],
});

interface AVOrderDetailsHeaderProps {
    currentDetails: IAVOrderDetails | null;
    editMode: boolean;
    handleCancel: () => void;
    notReadyToShip: boolean;
    orderNo: string | null;
    orderStatus: OrderStatus;
    setOrderStatus: React.Dispatch<SetStateAction<OrderStatus>>;
    setIsConfirming: React.Dispatch<SetStateAction<boolean>>;
    someBackOrdered: boolean;
    toggleEditMode: (state: "on" | "off") => void;
}
const AVOrderDetailsHeader: React.FC<AVOrderDetailsHeaderProps> = ({
    currentDetails,
    editMode,
    handleCancel,
    notReadyToShip,
    orderNo,
    orderStatus,
    setOrderStatus,
    setIsConfirming,
    someBackOrdered,
    toggleEditMode,
}) => {
    const { previousRoute } = useNavigationContext();
    const [previous, setPrevious] = useState<string>("/products/manage");
    const [lockedPrevious, setLockedPrevious] = useState<boolean>(false);

    const navigate = useNavigate();
    const authContext = useContext(AuthContext);
    const accessLevel = authContext?.user?.accessLevel;

    const limitedStatusOptions = ["in process", "cancelled"];
    const backOrderedStatusOptions = ["cancelled", "back ordered"];

    useEffect(() => {
        if (editMode && accessLevel === "view only") {
            toggleEditMode("off");
        }
    }, [editMode]);

    useEffect(() => {
        if (
            previousRoute &&
            !lockedPrevious &&
            !previousRoute.includes("order-details")
        ) {
            if (previousRoute.includes("orders/manage")) {
                setPrevious(previousRoute);
            } else {
                setPrevious(previousRoute);
            }
            setLockedPrevious(true);
        }
    }, [previousRoute, lockedPrevious]);

    return (
        <Grid
            container
            sx={{
                justifyContent: "space-between",
            }}
            size={12}
        >
            <Grid
                sx={{
                    order: {
                        xs: 2,
                        md: 1,
                    },
                }}
                size={{
                    xs: 12,
                    md: 6,
                }}
            >
                <h1
                    style={{
                        marginBottom: "15px",
                        marginTop: 0,
                    }}
                >
                    Order #{orderNo?.toLowerCase()}
                </h1>
            </Grid>
            <Grid
                container
                spacing={1}
                sx={{
                    justifyContent: "flex-end",
                    alignItems: "flex-start",
                    order: {
                        xs: 1,
                        md: 2,
                    },
                }}
                size={{
                    xs: 12,
                    md: 6,
                }}
            >
                <Grid
                    container
                    sx={{
                        justifyContent: {
                            xs: "space-between",
                            md: "flex-end",
                        },
                    }}
                    size={12}
                >
                    <Button
                        variant="outlined"
                        sx={{
                            color: "black",
                            marginBottom: "20px",
                        }}
                        onClick={() => navigate(previous || "/orders/manage")}
                    >
                        &lt; Back
                    </Button>

                    {editMode && (
                        <div>
                            <Button
                                variant="contained"
                                onClick={() => setIsConfirming(true)}
                                sx={{
                                    marginLeft: "20px",
                                    marginBottom: "20px",
                                }}
                            >
                                Save
                            </Button>
                            <Button
                                sx={{
                                    marginLeft: "20px",
                                    marginBottom: "20px",
                                }}
                                variant="contained"
                                onClick={handleCancel}
                            >
                                Cancel
                            </Button>
                        </div>
                    )}
                    {!editMode && accessLevel !== "view only" && (
                        <Button
                            variant="contained"
                            onClick={() => {
                                toggleEditMode("on");
                            }}
                            sx={{
                                marginLeft: "20px",
                                marginBottom: "20px",
                            }}
                        >
                            Edit
                        </Button>
                    )}
                </Grid>
            </Grid>
            <Grid
                container
                sx={{
                    justifyContent: "space-between",
                    order: 3,
                }}
                size={12}
            >
                <Grid size={6}>
                    <div className="date">
                        <span style={{ fontWeight: 700 }}>Order Date</span>
                        <span>
                            {dayjs(currentDetails?.orderDate).format(
                                "DD MMMM, YYYY"
                            )}
                        </span>
                        <span>
                            {dayjs(currentDetails?.orderDate).format(
                                "HH:mm:ss"
                            )}
                        </span>
                    </div>
                </Grid>
                <Grid size={6}>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "flex-end",
                        }}
                    >
                        <div></div>
                        <div
                            style={{
                                maxWidth: "300px",
                                width: "100%",
                            }}
                        >
                            <SelectFieldNonFormik<OrderStatus>
                                label="Order Status"
                                name="orderStatus"
                                readOnly={editMode ? false : true}
                                multiple={false}
                                required={editMode ? true : false}
                                options={Array.from(orderStatusOptions)}
                                sx={
                                    editMode
                                        ? adminFormInputStyle
                                        : adminReadOnlyStyle
                                }
                                setAction={setOrderStatus}
                                value={orderStatus}
                                variant={editMode ? "filled" : "standard"}
                                optionsToStayEnabled={
                                    someBackOrdered
                                        ? backOrderedStatusOptions
                                        : limitedStatusOptions
                                }
                                someOptionsDisabled={
                                    notReadyToShip || someBackOrdered
                                }
                            />
                        </div>
                    </div>
                </Grid>
            </Grid>
        </Grid>
    );
};
export default AVOrderDetailsHeader;
