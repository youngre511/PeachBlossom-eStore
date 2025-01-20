import axios, { AxiosError } from "axios";
import { RecentView } from "../../customer/features/UserData/UserDataTypes";

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

export const setCookieConsent = (preferences: ConsentPreferences) => {
    const existingCookie = getCookie("cookieConsent");

    if (
        !existingCookie ||
        !JSON.parse(existingCookie).userChosen ||
        preferences.userChosen
    ) {
        setCookie(
            "cookieConsent",
            JSON.stringify(preferences),
            preferences.userChosen ? 365 : 30
        );
    }
};

export const renewConsentCookie = () => {
    const cookie = getCookie("cookieConsent");
    if (cookie) {
        const parsedCookie = JSON.parse(cookie);
        if (parsedCookie.userChosen) {
            renewCookie("cookieConsent", 365);
            if (parsedCookie.allowAll) {
            }
        }
    }
};

export const verifyActivityId = async () => {
    try {
        const response = await axios.get(
            `${import.meta.env.VITE_API_URL}/activity/verify`,
            { withCredentials: true }
        );
        console.log("Verifying activity id:", response.data);
    } catch (error) {
        if (error instanceof AxiosError) {
            console.error("Error placing order", error);
        } else {
            console.error("An unknown error has occurred while placing order");
        }
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
