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
    setCookie(
        "cookieConsent",
        JSON.stringify(preferences),
        preferences.userChosen ? 365 : 30
    );
};

export const renewConsentCookie = () => {
    const cookie = getCookie("cookieConsent");
    if (cookie) {
        const parsedCookie = JSON.parse(cookie);
        if (parsedCookie.userChosen) {
            renewCookie(cookie, 365);
        }
    }
};

export const addToRecentCookie = (productId: string) => {
    const recent = getCookie("recentlyViewed");
    if (!recent) {
        setCookie("recentlyViewed", JSON.stringify([productId]), 30);
    } else {
        const productArray = JSON.parse(recent);
        if (productArray.includes(productId)) {
            productArray.splice(productArray.indexOf(productId));
            productArray.unshift(productId);
        } else {
            if (productArray.length === 5) productArray.pop();
            productArray.unshift(productId);
        }
        setCookie("recentlyViewed", JSON.stringify(productArray), 30);
    }
};
