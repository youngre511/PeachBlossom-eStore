import { Button } from "@mui/material";
import React, { SetStateAction } from "react";
import "./cookie-consent.css";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import { setCookieConsent } from "../../utils/cookieUtils";
import { useAppDispatch } from "../../../customer/hooks/reduxHooks";
import { setAllowTracking } from "../../../customer/features/UserData/userDataSlice";
import axios, { AxiosError } from "axios";

interface CookieConsentProps {
    setShowConsentBanner: React.Dispatch<SetStateAction<boolean>>;
}
const CookieConsent: React.FC<CookieConsentProps> = ({
    setShowConsentBanner,
}) => {
    const dispatch = useAppDispatch();

    const handleAllowAll = async () => {
        setCookieConsent({ allowAll: true, userChosen: true });
        dispatch(setAllowTracking(true));
        setShowConsentBanner(false);
        try {
            await axios.get(`${import.meta.env.VITE_API_URL}/activity/assign`, {
                withCredentials: true,
            });
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error("Error placing order", error);
            } else {
                console.error(
                    "An unknown error has occurred while placing order"
                );
            }
        }
    };

    const revokeActivityId = async () => {
        try {
            dispatch(setAllowTracking(false));
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/activity/deleteId`,
                { withCredentials: true }
            );
        } catch (error) {
            if (error instanceof AxiosError) {
                console.error("Error revoking activityId", error);
            } else {
                console.error(
                    "An unknown error has occurred while revoking activityId"
                );
            }
        }
    };

    const handleClose = () => {
        setCookieConsent({ allowAll: false, userChosen: false });
        setShowConsentBanner(false);
        revokeActivityId();
    };

    const handleRequiredOnly = () => {
        setCookieConsent({ allowAll: false, userChosen: true });
        setShowConsentBanner(false);
        revokeActivityId();
    };

    return (
        <div className="consent-banner">
            <div className="consent-content">
                <h1>We value your privacy</h1>
                <p>
                    We use cookies to enhance your experience by generating
                    personalized product recommendations. These cookies are only
                    used on this site and will not track your activity on other
                    websites. They will not be used for advertising or email
                    marketing or be shared with third parties.
                </p>
                <p>
                    You can choose to allow all cookies or use essential cookies
                    only.
                </p>
                <div className="consent-buttons">
                    <Button variant="contained" onClick={handleAllowAll}>
                        Allow All
                    </Button>
                    <Button
                        variant="outlined"
                        onClick={handleRequiredOnly}
                        sx={{ marginLeft: "20px" }}
                    >
                        Essential Only
                    </Button>
                </div>
                <div
                    className="consent-banner-close"
                    onClick={handleClose}
                    role="button"
                >
                    <CloseSharpIcon />
                </div>
            </div>
        </div>
    );
};
export default CookieConsent;
