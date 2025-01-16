import React, { SetStateAction } from "react";
import "./footer.css";
import { Link } from "react-router-dom";

interface Props {
    setShowConsentBanner: React.Dispatch<SetStateAction<boolean>>;
}
const Footer: React.FC<Props> = ({ setShowConsentBanner }) => {
    return (
        <footer>
            <div className="links">
                <ul>
                    <li>
                        <Link to="/terms">Terms & Conditions</Link>
                    </li>
                    <li>
                        <Link to="/shipping-returns">Shipping & Returns</Link>
                    </li>
                    <li>
                        <Link to="/privacy">Privacy & Cookies</Link>
                    </li>
                    <li>
                        <div
                            className="manage-cookies"
                            onClick={() => setShowConsentBanner(true)}
                        >
                            Manage Cookies
                        </div>
                    </li>
                </ul>
            </div>
            <div className="copyright">
                &copy; Copyright 2024 Ryan Young. All Rights Reserved.
            </div>
        </footer>
    );
};
export default Footer;
