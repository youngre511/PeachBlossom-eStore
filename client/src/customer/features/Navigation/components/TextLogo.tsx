import React from "react";
import { useNavigate } from "react-router-dom";

import pbtext1x from "../../../../assets/peachblossomtext-1x.webp";
import pbtext2x from "../../../../assets/peachblossomtext-2x.webp";
import pbtext3x from "../../../../assets/peachblossomtext-3x.webp";

interface TextLogoProps {}
const TextLogo: React.FC<TextLogoProps> = () => {
    const navigate = useNavigate();
    return (
        <div className="m-text-only-logo" onClick={() => navigate("/")}>
            <img
                src={pbtext3x}
                srcSet={`${pbtext1x} 1x, ${pbtext2x} 2x, ${pbtext3x} 3x`}
                alt="peach blossom logo"
                width="150px"
                height="39.398px"
            />
        </div>
    );
};
export default TextLogo;
