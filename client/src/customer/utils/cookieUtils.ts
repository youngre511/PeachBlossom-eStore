import axios from "axios";
import { RecentView } from "../features/UserData/UserDataTypes";
import { AuthContextProps } from "../../common/contexts/authContext";
import { setAllowTracking } from "../features/UserData/userDataSlice";
import { AppDispatch } from "../store/customerStore";
import { logAxiosError } from "../../common/utils/logAxiosError";

export interface ConsentPreferences {
    allowAll: boolean;
    userChosen: boolean;
}

export const getCookie = (name: string) => {
    const cookies = document.cookie.split("; ");
    const cookie = cookies.find((row) => row.startsWith(`${name}=`));
    return cookie ? decodeURIComponent(cookie.split("=")[1]) : null;
};

export const setCookie = (name: string, value: any, days: number) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(
        value
    )}; path=/; expires=${expires}; SameSite=Lax`;
};

export const renewCookie = (name: string, days: number) => {
    const cookieValue = getCookie(name);
    setCookie(name, cookieValue, days);
};

export const setCookieConsent = async (
    preferences: ConsentPreferences,
    dispatch: AppDispatch,
    auth: AuthContextProps | undefined,
    syncing?: boolean
) => {
    const existingCookie = getCookie("cookieConsent");

    // Check if a new cookie needs to be set or updated
    const shouldSetCookie = (
        cookie: string | null,
        preferences: ConsentPreferences
    ): boolean => {
        if (!cookie) return true; // No cookie exists, so update is needed
        const parsed = JSON.parse(cookie);
        return (
            !parsed.userChosen || // Cookie was not explicitly chosen by the user
            preferences.userChosen || // User made an explicit choice now
            parsed.allowAll !== preferences.allowAll // Preferences have changed
        );
    };

    // Handle server updates for tracking consent
    const updateServerConsent = async () => {
        try {
            // Request a trackingId if allowAll is true. If allowAll is false and user has actively chosen this option, revoke existing activityId
            if (preferences.allowAll) {
                await axios.get(
                    `${import.meta.env.VITE_API_URL}/activity/assign`,
                    {
                        withCredentials: true,
                    }
                );
            } else if (preferences.userChosen) {
                await revokeActivityId();
            }

            if (auth && auth.user && !syncing) {
                const token = localStorage.getItem("jwtToken");
                await axios.put(
                    `${import.meta.env.VITE_API_URL}/activity/setCookieConsent`,
                    {
                        allowAll: true,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                        },
                    }
                );
            }
        } catch (error: any) {
            logAxiosError(error);
        }
    };

    // Main function logic
    if (shouldSetCookie(existingCookie, preferences)) {
        setCookie(
            "cookieConsent",
            JSON.stringify(preferences),
            preferences.userChosen ? 365 : 30
        );
        dispatch(setAllowTracking(preferences.allowAll));
        await updateServerConsent();
    } else {
        renewConsentCookie(dispatch);
    }
};

export const renewConsentCookie = (dispatch: AppDispatch) => {
    const cookie = getCookie("cookieConsent");
    if (cookie) {
        const parsedCookie = JSON.parse(cookie);
        dispatch(setAllowTracking(parsedCookie.allowAll));
        if (parsedCookie.userChosen) {
            renewCookie("cookieConsent", 365);
        }
    }
};

export const verifyActivityId = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/activity/verify`,
            { withCredentials: true }
        );
    } catch (error) {
        logAxiosError(error);
    }
};

export const revokeActivityId = async () => {
    try {
        await axios.delete(
            `${import.meta.env.VITE_API_URL}/activity/deleteId`,
            { withCredentials: true }
        );
    } catch (error) {
        logAxiosError(error, "revoking activityId");
    }
};

export const addToRecentCookie = (product: RecentView) => {
    const recent = getCookie("recentlyViewed");
    if (!recent) {
        setCookie("recentlyViewed", JSON.stringify([product]), 60);
    } else {
        const productArray = JSON.parse(recent);
        const existingRecord = productArray.findIndex(
            (record: RecentView) => record.productNo === product.productNo
        );
        if (existingRecord !== -1) {
            productArray.splice(existingRecord);
        } else if (productArray.length === 5) {
            productArray.pop();
        }
        productArray.unshift(product);
        setCookie("recentlyViewed", JSON.stringify(productArray), 60);
    }
};

export const syncRecentCookie = (recentList: RecentView[]) => {
    setCookie("recentlyViewed", JSON.stringify(recentList), 60);
};

export const getRecentCookie = (): RecentView[] | null => {
    const recent = getCookie("recentlyViewed");
    if (!recent) {
        return null;
    } else {
        return JSON.parse(recent);
    }
};

/**
 * @description A function to import user cookieConsent settings from user account to local machine, overriding local machine settings if userAccount settings have been actively chosen.
 * @returns true if sync has overridden local settings, false if user settings match local settings
 * Response is used to determine whether or not to display a banner notifying user of local machine changes.
 */
export const syncCookieConsent = async (
    dispatch: AppDispatch,
    auth: AuthContextProps | undefined
) => {
    try {
        const token = localStorage.getItem("jwtToken");
        const cookie = getCookie("cookieConsent");
        let parsed;
        if (cookie) {
            parsed = JSON.parse(cookie);
        }

        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/activity/cookieConsent`,
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Include the token in the Authorization header
                },
            }
        );

        console.log(response.data);
        const { allowAll, userChosen } = response.data;

        if (userChosen) {
            setCookieConsent({ allowAll, userChosen }, dispatch, auth, true);
        }

        if (parsed && parsed.allowAll !== allowAll) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        logAxiosError(error);
    }
};
