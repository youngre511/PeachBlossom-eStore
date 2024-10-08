import React from "react";
import { ReactNode } from "react";

interface Props {
    children: ReactNode;
    className?: string;
}
const BlankPopup: React.FC<Props> = ({ children, className }) => {
    return (
        <div
            className={
                className ? `${className}-container` : "blank-popup-container"
            }
            style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "calc(100vw - 20px)",
                height: "calc(100vh - 20px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 1230,
                margin: "10px",
            }}
        >
            <div
                className={className ? className : "blank-popup"}
                style={{
                    width: "350px",
                    height: "200px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "5px solid #ec7f52",
                    boxShadow: "0 0 3px 2px rgba(0, 0, 0, 0.3)",
                    backgroundColor: "var(--peach-blossom)",
                    borderRadius: "10px",
                }}
            >
                {children}
            </div>
        </div>
    );
};
export default BlankPopup;
