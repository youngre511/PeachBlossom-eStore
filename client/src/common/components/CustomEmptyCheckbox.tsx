import React, { useState } from "react";

interface CustomEmptyCheckboxProps {}
const CustomEmptyCheckbox: React.FC<CustomEmptyCheckboxProps> = () => {
    return (
        <div
            style={{
                width: "24px",
                height: "24px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
            }}
        >
            <div
                style={{
                    width: "18px",
                    height: "18px",
                    border: `1px solid rgba(0, 0, 0, 0.4)`,
                    borderRadius: "3px",
                }}
            ></div>
        </div>
    );
};
export default CustomEmptyCheckbox;
