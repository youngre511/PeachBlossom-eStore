import React from "react";
import { useEffect } from "react";
import "./footer.css";
import { Link } from "react-router-dom";

interface Props {}
const Footer: React.FC<Props> = () => {
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
                </ul>
            </div>
            <div className="copyright">
                &copy; Copyright 2024 Ryan Young. All Rights Reserved.
            </div>
        </footer>
    );
};
export default Footer;
