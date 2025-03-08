import { Button } from "@mui/material";
import React, { SetStateAction, useContext } from "react";
import "./cookie-consent.css";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";

import { useAppDispatch } from "../../../customer/hooks/reduxHooks";
import { setAllowTracking } from "../../../customer/features/UserData/userDataSlice";
import axios, { AxiosError } from "axios";
import { setCookieConsent } from "../../utils/cookieUtils";
import { AuthContext } from "../../../common/contexts/authContext";
import { logAxiosError } from "../../../common/utils/logAxiosError";

interface CookieConsentProps {
    setShowConsentBanner: React.Dispatch<SetStateAction<boolean>>;
    confirmationMessage?: boolean;
}
const CookieConsent: React.FC<CookieConsentProps> = ({
    setShowConsentBanner,
}) => {
    const dispatch = useAppDispatch();
    const auth = useContext(AuthContext);

    const handleAllowAll = async () => {
        setCookieConsent({ allowAll: true, userChosen: true }, dispatch, auth);
        setShowConsentBanner(false);
    };

    const handleClose = async () => {
        setCookieConsent(
            { allowAll: false, userChosen: false },
            dispatch,
            auth
        );
        setShowConsentBanner(false);
    };

    const handleRequiredOnly = async () => {
        setCookieConsent({ allowAll: false, userChosen: true }, dispatch, auth);
        setShowConsentBanner(false);
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
