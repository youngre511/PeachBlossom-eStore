import axios from "axios";
import { AppThunk, RootState } from "../../store/customerStore";
import { createAsyncThunk } from "@reduxjs/toolkit";
import {
    addToRecentCookie,
    getRecentCookie,
    syncRecentCookie,
} from "../../utils/cookieUtils";
import {
    ActivityRecord,
    ActivityType,
    RecentView,
    RecentViewInput,
} from "./UserDataTypes";
import { addActivity, updateRecent } from "./userDataSlice";

/**
 * @description This function pushes activity logs stored in the userData slice to the back end, where it is entered into the database.
 * It contains logic to ensure that the call is not made if the array of logs is empty, and the associated action creators empty the activity log if the push is successful.
 */

export const pushActivityLogs = createAsyncThunk<
    void,
    void,
    { state: RootState }
>(
    "userData/pushActivityLogs",
    async (_, { dispatch, getState, rejectWithValue }) => {
        try {
            const token = localStorage.getItem("jwtToken");
            const state = getState() as RootState;
            const allowed = state.userData.preferences.allowTracking;
            if (!allowed) return;

            const records = state.userData.activity;
            console.log("RECORDS:", records);
            if (records.length === 0) {
                return;
            }

            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/activity/addLogs`,
                { logs: records },
                {
                    headers: {
                        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                    },
                    withCredentials: true,
                }
            );

            return;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error);
        }
    }
);

/**
 * @description This function sets up an interval that calls pushActivityLogs every 60 seconds if userData.preferences.allowTracking is set to true. If it isn't, it clears the interval.
 * A related useEffect in App.tsx listens for changes to allowTracking and calls this function to set up the interval whenever it is set to true.
 */
export const startActivityLogPusher =
    (): AppThunk<() => void> => (dispatch, getState) => {
        let interval: NodeJS.Timeout | null = null;
        const checkAndPushLogs = () => {
            const state = getState();
            const allowed = state.userData.preferences.allowTracking;

            if (allowed) {
                dispatch(pushActivityLogs());
            } else {
                if (interval) {
                    clearInterval(interval);
                    interval = null;
                }
                return;
            }
        };

        interval = setInterval(checkAndPushLogs, 60000);

        return () => {
            if (interval) clearInterval(interval);
        };
    };

/**
 * @description This function centralizes the functions needed when the user views the details for a product.
 * It dispatches calls to add a record of the view to the userData recentlyViewed array, to the associated recentlyViewed cookie, and to the activity log.
 * @param {{productNo: string, thumbnailUrl: string, productName: string}} product - The relevant product details to be stored
 */
export const addProductView =
    (product: RecentViewInput): AppThunk<void> =>
    (dispatch, getState) => {
        const timestamp = new Date().toISOString();
        addToRecentCookie({ timestamp, ...product });
        const state = getState();
        const recentList = state.userData.data.recentlyViewed;
        const newList = recentList.filter(
            (record: RecentView) => record.productNo !== product.productNo
        );

        if (newList.length === 5) {
            newList.pop();
        }

        newList.unshift({ timestamp, ...product });

        dispatch(updateRecent(newList));

        dispatch(
            logActivity({
                activityType: "productView",
                productNo: product.productNo,
            })
        );

        return;
    };

/**
 * @description This is the general function for adding logs to the activity array. It requires that any activities with the type searchTerm include the argument searchTerm and all other activities to include productNo or productNos
 */
export const logActivity =
    (data: {
        activityType: ActivityType;
        productNo?: string | string[];
        searchTerm?: string;
    }): AppThunk<void> =>
    (dispatch) => {
        const timestamp = new Date().toISOString();
        const activityLogs: ActivityRecord[] = [];
        let { activityType, productNo, searchTerm } = data;

        if (productNo && activityType !== "search") {
            if (!Array.isArray(productNo)) {
                productNo = [productNo];
            }

            for (let number of productNo) {
                const activityLog: ActivityRecord = {
                    activityType,
                    timestamp,
                    productNo: number,
                };
                activityLogs.push(activityLog);
            }
        } else if (activityType === "search" && searchTerm) {
            const activityLog: ActivityRecord = {
                activityType,
                timestamp,
                searchTerm,
            };
            activityLogs.push(activityLog);
        }

        dispatch(addActivity(activityLogs));
        return;
    };

/**
 * @description This is a function to bring recentCookie, the recentlyViewed list in userData slice, and (if applicable) the recentlyViewed array in the sqlCustomer table into sync.
 * If the user is logged in, it combines the recently viewed lists in the recentCookie and userData slice and sends the data to an apiEndpoint for syncing cookie data, which compares it to the list recorded in the customer table.
 * That api call returns a list of the five most recently viewed items.
 * If the user is not logged in (and there is therefore no token), it creates a combined list containing the five most recently viewed items and dispatches calls to update the userData slice and the cookie with the new combined list.
 */

export const syncRecentlyViewed = createAsyncThunk<
    void,
    void,
    { state: RootState }
>(
    "userData/syncRecentlyViewed",
    async (_, { dispatch, getState, rejectWithValue }) => {
        try {
            const cookieList = getRecentCookie();
            const token = localStorage.getItem("jwtToken");
            const state = getState() as RootState;
            const recentList = state.userData.data.recentlyViewed;
            let syncedList;

            if (token) {
                let combinedList;

                if (cookieList) {
                    combinedList = [...recentList, ...cookieList];
                } else {
                    combinedList = recentList;
                }

                const response = await axios.put(
                    `${import.meta.env.VITE_API_URL}/user/syncRecent`,
                    { recentlyViewed: combinedList },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                        },
                        withCredentials: true,
                    }
                );

                syncedList = response.data;
            } else {
                if (cookieList) {
                    if (recentList.length === 0) {
                        dispatch(updateRecent(cookieList));
                    } else {
                        const newList = [
                            ...cookieList,
                            ...recentList.filter(
                                (view) =>
                                    !cookieList.some(
                                        (record) =>
                                            record.timestamp ===
                                                view.timestamp &&
                                            record.productNo === view.productNo
                                    )
                            ),
                        ];

                        newList.sort((a, b) =>
                            b.timestamp.localeCompare(a.timestamp)
                        );

                        syncedList = newList.slice(0, 5);
                    }
                }
            }

            if (syncedList) {
                syncRecentCookie(syncedList);
                dispatch(updateRecent(syncedList));
            }

            return;
        } catch (error: any) {
            return rejectWithValue(error.response?.data || error);
        }
    }
);
