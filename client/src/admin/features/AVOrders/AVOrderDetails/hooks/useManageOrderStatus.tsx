import { useState, useEffect, useCallback, SetStateAction } from "react";
import { IAVOrderItem, OrderStatus } from "../../avOrdersTypes";

interface ManageOrderStatusSyncProps {
    items: IAVOrderItem[];
}

interface ManageOrderStatusSync {
    orderStatus: OrderStatus;
    setOrderStatus: React.Dispatch<SetStateAction<OrderStatus>>;
    someBackOrdered: boolean;
    notReadyToShip: boolean;
}

function useManageOrderStatusSync({
    items,
}: ManageOrderStatusSyncProps): ManageOrderStatusSync {
    const [orderStatus, setOrderStatus] = useState<OrderStatus>("in process");
    const [someBackOrdered, setSomeBackOrdered] = useState<boolean>(false);
    const [notReadyToShip, setNotReadyToShip] = useState<boolean>(false);

    useEffect(() => {
        let processing: boolean = false;
        let cancelled: boolean = false;
        let ready: boolean = false;
        let backOrdered: boolean = false;
        let numberCancelled: number = 0;
        let numberFulfilled: number = 0;
        for (const item of items) {
            if (item.fulfillmentStatus !== "fulfilled") {
                if (item.fulfillmentStatus === "cancelled") {
                    numberCancelled++;
                    if (numberCancelled === items.length) {
                        cancelled = true;
                    } else {
                        cancelled = false;
                    }
                } else if (item.fulfillmentStatus === "back ordered") {
                    backOrdered = true;
                } else {
                    processing = true;
                }
            } else {
                numberFulfilled++;
                if (
                    numberFulfilled !== 0 &&
                    numberFulfilled + numberCancelled === items.length
                ) {
                    ready = true;
                }
            }
        }
        if (cancelled) {
            setOrderStatus("cancelled");
            setNotReadyToShip(true);
            if (backOrdered) {
                setSomeBackOrdered(true);
            } else {
                setSomeBackOrdered(false);
            }
        } else if (backOrdered) {
            setOrderStatus("back ordered");
            setNotReadyToShip(true);
            setSomeBackOrdered(true);
        } else if (processing) {
            setOrderStatus("in process");
            setNotReadyToShip(true);
            setSomeBackOrdered(false);
        } else if (
            ready &&
            (orderStatus === "in process" ||
                orderStatus === "cancelled" ||
                orderStatus === "back ordered")
        ) {
            setOrderStatus("ready to ship");
            setNotReadyToShip(false);
            setSomeBackOrdered(false);
        }
    }, [items]);

    return { orderStatus, setOrderStatus, notReadyToShip, someBackOrdered };
}

export default useManageOrderStatusSync;
