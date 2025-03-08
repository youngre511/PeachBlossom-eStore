import React from "react";
import "./support.css";

interface Props {}
const Support: React.FC<Props> = () => {
    return (
        <div className="support">
            <p>
                For questions about this website or to report bugs, contact me
                via the form on my portfolio site,{" "}
                <a
                    href="https://ryanyoung.codes"
                    target="_blank"
                    rel="noopener"
                >
                    https://ryanyoung.codes
                </a>
                .
            </p>
            <p>
                Note: this is not a real e-store. It is a portfolio project.
                None of the products are real or for sale.
            </p>
        </div>
    );
};
export default Support;
